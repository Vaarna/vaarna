import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDbConfig, Service, ServiceParams } from "./common";
import { uuid } from "util/uuid";
import { marshall } from "@aws-sdk/util-dynamodb";
import { LogEvent, LogItem, LogItems } from "type/log";
import { getItemsFromTable } from "util/dynamodb";
import config from "config";
import { evaluate } from "render";
import { WithPKSK } from "type/dynamo";

type LogServiceParams = ServiceParams;

export class LogService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;

  constructor(params: LogServiceParams) {
    super(params, { tableName: config.TABLE_NAME });

    this.tableName = config.TABLE_NAME;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
  }

  async get(spaceId: string): Promise<LogItems> {
    const items = await getItemsFromTable(this.db, {
      tableName: this.tableName,
      pk: { prefix: "space:", value: spaceId },
      sk: { value: null },
    });

    return LogItems.parse(items);
  }

  async event(event: LogEvent): Promise<LogItem> {
    const now = new Date().getTime();
    const logId = uuid();

    let message: WithPKSK<LogItem>;
    switch (event.type) {
      case "MESSAGE":
        message = {
          pk: `space:${event.spaceId}`,
          sk: `log:${logId}`,
          spaceId: event.spaceId,
          logId,
          t: now,
          msg: event.msg,
        };
        break;

      case "ROLL":
        message = {
          pk: `space:${event.spaceId}`,
          sk: `log:${logId}`,
          spaceId: event.spaceId,
          logId,
          t: now,
          expr: event.expr,
          msg: evaluate(event.expr, []),
        };
        break;
    }

    const cmd = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(message),
    });

    await this.db.send(cmd);
    return message;
  }
}
