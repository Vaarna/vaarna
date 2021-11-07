import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dynamoDbConfig, Service, ServiceParams } from "./common";
import { Table, UpdateTableBody } from "type/table";
import { ApiInternalServerError, ApiNotFoundError } from "type/error";
import config from "config";
import { z } from "zod";

type TableServiceConfig = ServiceParams;

export class TableService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;

  constructor(params: TableServiceConfig) {
    super(params, { tableName: config.SPACE_TABLE });

    this.tableName = config.SPACE_TABLE;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
  }

  async getTable(spaceId: string): Promise<Table> {
    const cmd = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ spaceId, sk: "table" }),
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
      Key: marshall({ spaceId: table.spaceId, sk: "table" }),
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

      return Table.parse(unmarshall(res.Attributes));
    } catch (err) {
      const parsedErr = z
        .object({ name: z.literal("ResourceNotFoundException") })
        .safeParse(err);

      if (parsedErr.success) {
        const out = {
          spaceId: table.spaceId,
          sk: "table",
          assetId: table.assetId,
          updated: now,
        };
        const cmd = new PutItemCommand({
          TableName: this.tableName,
          Item: marshall(out),
        });

        await this.db.send(cmd);

        return out;
      }

      throw err;
    }
  }
}
