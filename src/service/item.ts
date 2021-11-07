import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as v4uuid } from "uuid";

import {
  Item,
  ItemCreate,
  Items,
  ItemUpdate,
  GetItemsQuery,
  RemoveItemQuery,
} from "type/item";
import { getItemsFromTable } from "util/dynamodb";
import { dynamoDbConfig, Service, ServiceParams } from "./common";
import config from "config";
import { SpaceItem } from "type/space";
import { z } from "zod";

type ItemServiceParams = ServiceParams;

export class ItemService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;

  constructor(params: ItemServiceParams) {
    super(params, { tableName: config.SPACE_TABLE });

    this.tableName = config.SPACE_TABLE;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
  }

  async getItems({ spaceId, itemId }: GetItemsQuery): Promise<Items> {
    const items = await getItemsFromTable(this.db, {
      tableName: this.tableName,
      partition: { key: "spaceId", value: spaceId },
      sort: { key: "sk", prefix: "item:", value: itemId },
    });
    return Items.parse(
      items.map((v) => SpaceItem.parse(v)).filter((v) => v.sk.startsWith("item:"))
    );
  }

  async createItem(item: ItemCreate): Promise<Item> {
    const itemId = v4uuid();
    const now = new Date().getTime();
    this.logger.error(item, "create item");
    const fullItem = Item.parse({
      ...item,
      sk: `item:${itemId}`,
      itemId,
      created: now,
      updated: now,
      version: 0,
    });

    const cmd = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(fullItem),
    });

    await this.db.send(cmd);

    return fullItem;
  }

  async updateItem(item: ItemUpdate): Promise<Item | null> {
    const now = new Date().getTime();

    const noTouchy = new Set([
      "spaceId",
      "sk",
      "version",
      "itemId",
      "type",
      "created",
      "version",
    ]);

    const fieldsToUpdate = Object.keys({
      ...item,
    }).filter((v) => !noTouchy.has(v));

    const updateExpr = `SET ${[
      "updated = :updated",
      "version = version + :version_increment",
      ...fieldsToUpdate.map((v) => `#${v} = :${v}`),
    ].join(", ")}`;

    const attributeValues = marshall({
      ":version": item.version,
      ":version_increment": 1,
      ":updated": now,
      ...Object.fromEntries(fieldsToUpdate.map((v) => [`:${v}`, (item as never)[v]])),
    });

    const attributeNames = Object.fromEntries(fieldsToUpdate.map((v) => [`#${v}`, v]));

    const { spaceId, itemId } = item;

    const cmd = new UpdateItemCommand({
      TableName: this.tableName,
      Key: marshall({ spaceId, sk: `item:${itemId}` }),
      UpdateExpression: updateExpr,
      ConditionExpression: "version = :version",
      ExpressionAttributeValues: attributeValues,
      ExpressionAttributeNames: attributeNames,
      ReturnValues: "ALL_NEW",
    });
    const res = await this.db.send(cmd);

    if (res.Attributes) return Item.parse(unmarshall(res.Attributes));
    return null;
  }

  async removeItem({
    spaceId,
    itemId,
    version,
  }: RemoveItemQuery): Promise<Item | null> {
    const cmd = new DeleteItemCommand({
      TableName: this.tableName,
      Key: marshall({ spaceId, sk: `item:${itemId}` }),
      ConditionExpression: "version = :v",
      ExpressionAttributeValues: {
        ":v": { N: version },
      },
      ReturnValues: "ALL_OLD",
    });

    try {
      const res = await this.db.send(cmd);

      if (res.Attributes) return Item.parse(unmarshall(res.Attributes));
      return null;
    } catch (err) {
      const parsedErr = z
        .object({ name: z.literal("ConditionalCheckFailedException") })
        .passthrough()
        .safeParse(err);

      if (parsedErr.success) {
        this.logger.warn(
          parsedErr,
          "failed to delete item because either it does not exist, or it had the wrong version"
        );
        return null;
      }

      throw err;
    }
  }
}
