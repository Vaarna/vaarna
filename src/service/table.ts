import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoDbConfig, Service, ServiceConfig } from "./common";
import { Table, TableMessage, UpdateTableBody, UpdateTableEvent } from "type/table";
import { ApiInternalServerError, ApiNotFoundError } from "type/error";
import { roll } from "dice-roller";

type TableServiceConfig = {
  tableName: string;
} & ServiceConfig;

export class TableService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;

  constructor(config: TableServiceConfig) {
    super(config, { tableName: config.tableName });

    this.tableName = config.tableName;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
  }

  async getTable(spaceId: string): Promise<Table> {
    const cmd = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ spaceId }),
    });

    const res = await this.db.send(cmd);
    if (res.Item === undefined)
      throw new ApiNotFoundError(
        this.requestId,
        `table not found for space ${spaceId}`
      );

    return Table.parse(unmarshall(res.Item));
  }

  async updateTable(table: UpdateTableBody): Promise<Table> {
    const now = new Date().toISOString();

    const cmd = new UpdateItemCommand({
      TableName: this.tableName,
      Key: marshall({ spaceId: table.spaceId }),
      UpdateExpression:
        "SET updated = :updated, assetId = :assetId, messages = :messages",
      ExpressionAttributeValues: marshall({
        ":updated": now,
        ":assetId": table.assetId,
        ":messages": table.messages,
      }),
      ReturnValues: "ALL_NEW",
    });

    try {
      const res = await this.db.send(cmd);

      if (res.Attributes === undefined) {
        throw new ApiInternalServerError(this.requestId);
      }

      return Table.parse(unmarshall(res.Attributes));
    } catch (error) {
      if (error?.name === "ResourceNotFoundException") {
        const out = { ...table, updated: now };
        const cmd = new PutItemCommand({
          TableName: this.tableName,
          Item: marshall(out),
        });

        await this.db.send(cmd);

        return out;
      }

      throw error;
    }
  }

  async updateTableEvent(event: UpdateTableEvent): Promise<UpdateTableBody> {
    const now = new Date().toISOString();

    let cmd: UpdateItemCommand;
    switch (event.type) {
      case "NEW_MESSAGE": {
        const id = uuidv4();
        const message: TableMessage = { id, t: now, msg: event.content };
        cmd = new UpdateItemCommand({
          TableName: this.tableName,
          Key: marshall({ spaceId: event.spaceId }),
          UpdateExpression:
            "SET updated = :updated, messages = list_append(messages, :message)",
          ExpressionAttributeValues: marshall({
            ":updated": now,
            ":message": [message],
          }),
          ReturnValues: "ALL_NEW",
        });
        break;
      }

      case "EVAL": {
        const result = roll(event.expr);
        const messages = result.map((v) => ({
          id: uuidv4(),
          t: now,
          msg: v.toString(),
        }));
        cmd = new UpdateItemCommand({
          TableName: this.tableName,
          Key: marshall({ spaceId: event.spaceId }),
          UpdateExpression:
            "SET updated = :updated, messages = list_append(messages, :messages)",
          ExpressionAttributeValues: marshall({
            ":updated": now,
            ":messages": messages,
          }),
          ReturnValues: "ALL_NEW",
        });
        break;
      }

      default:
        throw new Error("unreachable");
    }

    try {
      const res = await this.db.send(cmd);

      if (res.Attributes === undefined) {
        throw new ApiInternalServerError(this.requestId);
      }

      return Table.parse(unmarshall(res.Attributes));
    } catch (error) {
      if (error?.name === "ResourceNotFoundException") {
        this.logger.error(
          error,
          `failed to update table ${event.spaceId} because it does not exist`
        );
        throw new ApiNotFoundError(this.requestId, "table does not exist");
      }

      throw error;
    }
  }
}
