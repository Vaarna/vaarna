import {
  BatchGetItemCommand,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { rootLogger } from "logger";

const logger = rootLogger.child({ module: "dynamodb" });

type GetItemsSingleParameters = {
  tableName: string;
  partition: { key: string; value: string };
  sort: { key: string; value: string };
};

async function getItemsSingle(
  db: DynamoDBClient,
  params: GetItemsSingleParameters
): Promise<unknown[]> {
  const cmd = new GetItemCommand({
    TableName: params.tableName,
    Key: marshall({
      [params.partition.key]: params.partition.value,
      [params.sort.key]: params.sort.value,
    }),
  });

  const res = await db.send(cmd);
  if (res.Item === undefined) {
    logger.error(params, "no items were returned when getting a single item");
    return [];
  }

  const item = unmarshall(res.Item);
  return [item];
}

type GetItemsMultipleParameters = {
  tableName: string;
  partition: { key: string; value: string };
  sort: { key: string; value: string[] };
};

async function getItemsMultiple(
  db: DynamoDBClient,
  params: GetItemsMultipleParameters
): Promise<unknown[]> {
  // TODO when requesting more than 100 items, batch the requests
  // TODO when the response returns UnprocessedKeys also get those

  if (params.sort.value.length > 100)
    logger.error(params, "requesting more than 100 items, request should be batched");

  const cmd = new BatchGetItemCommand({
    RequestItems: {
      [params.tableName]: {
        Keys: params.sort.value.map((v) =>
          marshall({
            [params.partition.key]: params.partition.value,
            [params.sort.key]: v,
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
  partition: { key: string; value: string };
  sort: { key: string };
};

async function getItemsAll(
  db: DynamoDBClient,
  params: GetItemsAllParameters
): Promise<unknown[]> {
  const cmdArgs = {
    TableName: params.tableName,
    KeyConditionExpression: `${params.partition.key} = :v`,
    ExpressionAttributeValues: {
      ":v": { S: params.partition.value },
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

type GetItemsParameters = {
  tableName: string;
  partition: { key: string; value: string };
  sort: { key: string; value: string[] | string | undefined };
};

export async function getItemsFromTable(
  db: DynamoDBClient,
  params: GetItemsParameters
): Promise<unknown[]> {
  const sortValue = params.sort.value;

  let items;
  if (typeof sortValue === "undefined") {
    logger.info("get all items from table %s", params.tableName);
    items = await getItemsAll(db, params);
  } else if (typeof sortValue === "string") {
    logger.info("get single item from table %s", params.tableName);
    items = await getItemsSingle(db, {
      ...params,
      sort: { ...params.sort, value: sortValue },
    });
  } else {
    logger.info("get multiple items from table %s", params.tableName);
    items = await getItemsMultiple(db, {
      ...params,
      sort: { ...params.sort, value: sortValue },
    });
  }

  logger.info("total of %s items returned from table", items.length);
  return items;
}
