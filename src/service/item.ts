import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as v4uuid } from "uuid";

import { GetItemsQuery, RemoveItemQuery } from "type/api";
import { Item, ItemCreate, Items, ItemUpdate } from "type/item";
import { getItemsFromTable } from "util/dynamodb";

const itemTable = "ItemsDev";

export async function getItems(params: GetItemsQuery): Promise<Items> {
  const { spaceId, itemId } = params;

  const items = await getItemsFromTable({
    tableName: itemTable,
    partition: { key: "spaceId", value: spaceId },
    sort: { key: "itemId", value: itemId },
  });

  return Items.parse(items);
}

export async function createItem(item: ItemCreate): Promise<Item> {
  const itemId = v4uuid();
  const now = new Date().toISOString();
  const fullItem = Item.parse({
    ...item,
    itemId,
    created: now,
    updated: now,
    version: 0,
  });

  const db = new DynamoDBClient({});

  const cmd = new PutItemCommand({
    TableName: itemTable,
    Item: marshall(fullItem),
  });

  const res = await db.send(cmd);

  return fullItem;
}

export async function updateItem(item: ItemUpdate) {
  const now = new Date().toISOString();

  const noTouchy = new Set(["spaceId", "itemId", "type", "created", "version"]);

  const fieldsToUpdate = Object.keys({
    ...item,
  }).filter((v) => !noTouchy.has(v));

  const updateExpr =
    "SET " +
    [
      "updated = :updated",
      "version = version + :version_increment",
      ...fieldsToUpdate.map((v) => `#${v} = :${v}`),
    ].join(", ");

  const attributeValues = marshall({
    ":version": item.version,
    ":version_increment": 1,
    ":updated": now,
    ...Object.fromEntries(
      fieldsToUpdate.map((v) => [":" + v, (item as any)[v]])
    ),
  });

  const attributeNames = Object.fromEntries(
    fieldsToUpdate.map((v) => ["#" + v, v])
  );

  const { spaceId, itemId } = item;

  const db = new DynamoDBClient({});

  const cmd = new UpdateItemCommand({
    TableName: itemTable,
    Key: marshall({ spaceId, itemId }),
    UpdateExpression: updateExpr,
    ConditionExpression: "version = :version",
    ExpressionAttributeValues: attributeValues,
    ExpressionAttributeNames: attributeNames,
    ReturnValues: "ALL_NEW",
  });

  const res = await db.send(cmd);

  if (res.Attributes) return unmarshall(res.Attributes);
  return null;
}

export async function removeItem(item: RemoveItemQuery) {
  const { spaceId, itemId, version } = item;

  const db = new DynamoDBClient({});

  const cmd = new DeleteItemCommand({
    TableName: itemTable,
    Key: marshall({ spaceId, itemId }),
    ConditionExpression: "version = :v",
    ExpressionAttributeValues: {
      ":v": { N: version },
    },
    ReturnValues: "ALL_OLD",
  });

  try {
    const res = await db.send(cmd);

    if (res.Attributes) return unmarshall(res.Attributes);
    return null;
  } catch (e) {
    if (e?.name === "ConditionalCheckFailedException") {
      const items = await getItems({ spaceId, itemId });
      if (items.length === 0) {
        // failed to delete item because the item does not exist
        return null;
      }

      // failed to delete the item because its version was different from the given version
      throw {
        msg: "failed to delete item because of version mismatch",
        item: items[0],
      };
    }

    throw e;
  }
}
