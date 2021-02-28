import {
  BatchGetItemCommand,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as v4uuid } from "uuid";

import { GetItemsQuery, RemoveItemQuery } from "type/api";
import { Item, ItemCreate, Items, ItemUpdate } from "type/item";

const itemTable = "ItemsDev";

export async function getItems(params: GetItemsQuery): Promise<Items> {
  const { spaceId, itemId } = params;

  const db = new DynamoDBClient({});

  if (typeof itemId === "undefined") {
    // all items
    const cmd = new QueryCommand({
      TableName: itemTable,
      KeyConditionExpression: "spaceId = :s",
      ExpressionAttributeValues: {
        ":s": { S: spaceId },
      },
    });

    const res = await db.send(cmd);
    const items = res.Items?.map((v) => unmarshall(v));
    return Items.parse(items);
  } else if (typeof itemId === "string") {
    // single item
    const cmd = new GetItemCommand({
      TableName: itemTable,
      Key: marshall({ spaceId, itemId }),
    });

    const res = await db.send(cmd);
    if (!res.Item) {
      return [];
    }

    const item = unmarshall(res.Item);
    return [Item.parse(item)];
  } else {
    // multiple items

    // TODO when requesting more than 100 items, batch the requests
    // TODO when the response returns UnprocessedKeys also get those
    const cmd = new BatchGetItemCommand({
      RequestItems: {
        [itemTable]: {
          Keys: itemId.map((v) => marshall({ spaceId, itemId })),
        },
      },
    });

    const res = await db.send(cmd);
    const out = [];
    if (res.Responses && itemTable in res.Responses) {
      for (const k in Object.keys(res.Responses[itemTable])) {
        const v = res.Responses[itemTable][k];
        if (v) out.push(unmarshall(v));
      }
    }

    return Items.parse(out);
  }
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
