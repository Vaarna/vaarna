import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dynamoDbConfig, Service, ServiceConfig } from "./common";
import { Table, UpdateTableBody } from "type/table";
import { ApiInternalServerError, ApiNotFoundError } from "type/error";

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

  async updateTable(table: UpdateTableBody): Promise<Table | null> {
    const now = new Date().toISOString();

    const cmd = new UpdateItemCommand({
      TableName: this.tableName,
      Key: marshall({ spaceId: table.spaceId }),
      UpdateExpression: "SET updated = :updated, assetId = :assetId",
      ExpressionAttributeValues: marshall({
        ":updated": now,
        ":assetId": table.assetId,
      }),
      ReturnValues: "ALL_NEW",
    });

    try {
      const res = await this.db.send(cmd);

      if (res.Attributes === undefined) {
        throw new ApiInternalServerError(this.requestId);
      }

      const parsed = Table.safeParse(res.Attributes);
      if (!parsed.success) return null;

      return parsed.data;
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
}
