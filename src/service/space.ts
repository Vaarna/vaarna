import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDbConfig, Service, ServiceParams } from "./common";
import config from "config";
import { CreateSheet, CreateSpace, Sheet, Space } from "type/space";
import { marshall } from "@aws-sdk/util-dynamodb";
import { uuid } from "util/uuid";
import { getItemsFromTable } from "util/dynamodb";
import { z } from "zod";
import { ApiNotFoundError } from "type/error";

type SpaceServiceParams = ServiceParams;

export class SpaceService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;

  constructor(params: SpaceServiceParams) {
    super(params, {
      tableName: config.TABLE_NAME,
    });

    this.tableName = config.TABLE_NAME;

    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
  }

  async getSpace(spaceId: Space["spaceId"]): Promise<Space> {
    const data = await getItemsFromTable(this.db, {
      tableName: this.tableName,
      pk: { prefix: "space:", value: spaceId },
      sk: { value: "data" },
    }).then(z.array(Space).parse);

    if (data.length !== 1)
      throw new ApiNotFoundError(this.requestId, "space not found");

    return data[0];
  }

  async createSpace(body: CreateSpace): Promise<Space> {
    const spaceId = uuid();
    const item = {
      ...body,
      spaceId,
    };

    const cmd = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall({ ...item, pk: `space:${spaceId}`, sk: "data" }),
    });

    await this.db.send(cmd);

    return item;
  }

  async getSheet(
    spaceId: Space["spaceId"],
    sheetId: Sheet["sheetId"][] | Sheet["sheetId"] | null
  ): Promise<Sheet[]> {
    return getItemsFromTable(this.db, {
      tableName: this.tableName,
      pk: { prefix: "space:", value: spaceId },
      sk: { prefix: "sheet:", value: sheetId },
    }).then(z.array(Sheet).parse);
  }

  async createSheet(spaceId: Space["spaceId"], body: CreateSheet): Promise<Sheet> {
    const sheetId = uuid();

    const item = {
      ...body,
      sheetId,
    };

    const cmd = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall({
        ...item,
        pk: `space:${spaceId}`,
        sk: `sheet:${sheetId}`,
      }),
    });

    await this.db.send(cmd);

    return item;
  }
}
