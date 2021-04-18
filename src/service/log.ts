import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDbConfig, Service, ServiceConfig } from "./common";
import { v4 as uuidv4 } from "uuid";
import { marshall } from "@aws-sdk/util-dynamodb";
import { roll } from "dice-roller";
import { LogEvent, LogItem, LogItems } from "type/log";
import { getItemsFromTable } from "util/dynamodb";

type LogServiceConfig = {
  tableName: string;
} & ServiceConfig;

export class LogService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;

  constructor(config: LogServiceConfig) {
    super(config, { tableName: config.tableName });

    this.tableName = config.tableName;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
  }

  async get(spaceId: string): Promise<LogItems> {
    const items = await getItemsFromTable(this.db, {
      tableName: this.tableName,
      partition: { key: "spaceId", value: spaceId },
      sort: { key: "messageId", value: undefined },
    });

    return LogItems.parse(items);
  }

  async event(event: LogEvent): Promise<LogItem> {
    const now = new Date().getTime();
    const messageId = uuidv4();

    let message: LogItem;
    // eslint-disable-next-line default-case
    switch (event.type) {
      case "MESSAGE":
        message = {
          spaceId: event.spaceId,
          messageId,
          t: now,
          msg: event.msg,
        };
        break;

      case "ROLL":
        message = {
          spaceId: event.spaceId,
          messageId,
          t: now,
          msg: roll(event.expr)
            .map((v) => v.toString())
            .join("\n"),
          expr: event.expr,
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
