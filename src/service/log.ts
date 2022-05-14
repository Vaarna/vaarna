import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { dynamoDbConfig, Service, ServiceParams } from "./common";
import { getItemsFromTable } from "util/dynamodb";
import config from "config";
import { LogItem } from "type/space";
import { z } from "zod";

type LogServiceParams = ServiceParams;

export class LogService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;

  constructor(params: LogServiceParams) {
    super(params, { tableName: config.TABLE_NAME });

    this.tableName = config.TABLE_NAME;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
  }

  async getAll(spaceId: string): Promise<LogItem[]> {
    const items = await getItemsFromTable(this.db, {
      tableName: this.tableName,
      pk: { prefix: "space:log:", value: spaceId },
      sk: { value: null },
    });

    return z.array(LogItem).parse(items);
  }

  // eslint-disable-next-line class-methods-use-this
  async event(_event: unknown): Promise<LogItem> {
    // takes an event, evaluates it, adds it to the db, and returns the result
    throw new Error("not implemented");
  }
}
