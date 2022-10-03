import {
  BatchGetItemCommand,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import { rootLogger } from "@vaarna/logging";

const logger = rootLogger.child({ module: "dynamodb" });

type GetItemsSingleParameters = {
  tableName: string;
  pk: string;
  sk: string;
};

async function getItemsSingle(
  db: DynamoDBClient,
  params: GetItemsSingleParameters
): Promise<unknown[]> {
  const cmd = new GetItemCommand({
    TableName: params.tableName,
    Key: marshall({
      pk: params.pk,
      sk: params.sk,
    }),
  });

  const res = await db.send(cmd);
  if (res.Item === undefined) {
    logger.error(params, "no items were returned when getting a single item");
    return [];
  }

  return [unmarshall(res.Item)];
}

type GetItemsMultipleParameters = {
  tableName: string;
  pk: string;
  sk: string[];
};

async function getItemsMultiple(
  db: DynamoDBClient,
  params: GetItemsMultipleParameters
): Promise<unknown[]> {
  // TODO when requesting more than 100 items, batch the requests
  // TODO when the response returns UnprocessedKeys also get those

  if (params.sk.length > 100)
    logger.error(params, "requesting more than 100 items, request should be batched");

  const cmd = new BatchGetItemCommand({
    RequestItems: {
      [params.tableName]: {
        Keys: params.sk.map((v) =>
          marshall({
            pk: params.pk,
            sk: v,
          })
        ),
      },
    },
  });

  const res = await db.send(cmd);

  if (res.UnprocessedKeys)
    logger.error(res, "response returned UnprocessedKeys but we did not get those");

  const items = [];
  if (res.Responses && params.tableName in res.Responses) {
    for (const k in Object.keys(res.Responses[params.tableName])) {
      const v = res.Responses[params.tableName][k];
      if (v) items.push(unmarshall(v));
    }
  }

  return items;
}

type GetItemsAllParameters = {
  tableName: string;
  pk: string;
};

async function getItemsAll(
  db: DynamoDBClient,
  params: GetItemsAllParameters
): Promise<unknown[]> {
  const cmdArgs = {
    TableName: params.tableName,
    KeyConditionExpression: `pk = :v`,
    ExpressionAttributeValues: {
      ":v": { S: params.pk },
    },
  };

  const cmd = new QueryCommand(cmdArgs);

  const res = await db.send(cmd);
  const items = res.Items?.map((v) => unmarshall(v)) ?? [];
  let lastEvaluatedKey = res.LastEvaluatedKey;
  if (items.length === 0 && lastEvaluatedKey === undefined) {
    logger.error(params, "no items were returned when getting all items");
    return [];
  }

  while (lastEvaluatedKey !== undefined) {
    const cmd = new QueryCommand({
      ...cmdArgs,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const res = await db.send(cmd);

    items.push(...(res.Items?.map((v) => unmarshall(v)) ?? []));
    lastEvaluatedKey = res.LastEvaluatedKey;
  }

  return items;
}

type GetItemsBase = {
  tableName: string;
  pk: { prefix?: string; value: string };
};

type GetAllItems = GetItemsBase & {
  sk: { value: null };
};

type GetSingleItemOrMultiple = GetItemsBase & {
  sk: { prefix?: string; value: string[] | string };
};

export async function getItemsFromTable(
  db: DynamoDBClient,
  params: GetAllItems | GetSingleItemOrMultiple
): Promise<unknown[]> {
  const { tableName } = params;
  const pk = `${params.pk.prefix ?? ""}${params.pk.value}`;
  const skPrefix = "prefix" in params.sk ? params.sk.prefix ?? "" : "";
  const skValue = params.sk.value;

  let items;
  if (skValue === null) {
    logger.info("get all items from table %s", tableName);
    items = await getItemsAll(db, { tableName, pk });
  } else if (typeof skValue === "string") {
    logger.info("get single item from table %s", tableName);
    items = await getItemsSingle(db, {
      tableName,
      pk,
      sk: `${skPrefix}${skValue}`,
    });
  } else {
    logger.info("get multiple items from table %s", tableName);
    items = await getItemsMultiple(db, {
      tableName,
      pk,
      sk: skValue.map((v) => `${skPrefix}${v}`),
    });
  }

  logger.info("total of %s items returned from table", items.length);
  return items;
}
