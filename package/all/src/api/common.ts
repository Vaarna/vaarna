import {
  AttributeValue,
  DynamoDBClient,
  DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import axios, { AxiosInstance } from "axios";
import P from "pino";
import { z } from "zod";

import { Group, ItemBase, Sheet, Space } from "@gm-screen/type";

import config from "../config";
import { asAWSLogger } from "../logger";
import { RequestWithLogger } from "../util/withDefaults";

// --- BACKEND ---

const dynamoDbConfig = (logger: P.Logger): DynamoDBClientConfig => ({
  logger: asAWSLogger("DynamoDB", logger),
  endpoint: config.DYNAMODB_ENDPOINT,
});

export type CommonBackendConfig = {
  requestId: string;
  logger: P.Logger;
};

const commonBackendConfigFromRequest = (
  req: RequestWithLogger
): CommonBackendConfig => {
  return { requestId: req.requestId, logger: req.logger };
};

export type DynamoDbConfig = CommonBackendConfig & {
  db: DynamoDBClient;
  tableName: string;
};

export const dynamoDbConfigFromRequest = (req: RequestWithLogger): DynamoDbConfig => {
  const c = commonBackendConfigFromRequest(req);

  return {
    ...c,
    db: new DynamoDBClient(dynamoDbConfig(c.logger)),
    tableName: config.TABLE_NAME,
  };
};

type DynamoDbUpdateParams = {
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues: Record<string, AttributeValue>;
  UpdateExpression: string;
};

type DynamoDbScalar = string | number | boolean | null;
type DynamoDbDocument = DynamoDbScalar[];

type DynamoDbValue = DynamoDbScalar | DynamoDbDocument;

export const createDynamoDbUpdate = (
  conf: CommonBackendConfig,
  v: Record<string, DynamoDbValue>,
  ignoreKeys?: string[]
): DynamoDbUpdateParams => {
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, DynamoDbValue> = {};
  const ks: Record<string, string> = {};

  for (const [key, value] of Object.entries(v)) {
    if (ignoreKeys?.includes(key)) continue;

    ExpressionAttributeNames[`#${key}`] = key;
    ExpressionAttributeValues[`:${key}`] = value;
    ks[`#${key}`] = `:${key}`;
  }

  const UpdateExpression = `SET ${Object.entries(ks)
    .map(([k, v]) => `${k} = ${v}`)
    .join(", ")}`;

  const out = {
    ExpressionAttributeNames,
    ExpressionAttributeValues: marshall(ExpressionAttributeValues),
    UpdateExpression,
  };

  conf.logger.info(out, "constructed UpdateItem parameters");

  return out;
};

// --- FRONTEND ---

export type FrontendOptions = {
  signal?: AbortSignal;
  requestId?: string;
};

const headers = (o?: FrontendOptions): Record<string, string> =>
  Object.fromEntries(
    [["X-Request-Id", o?.requestId]].filter((v) => v[1] !== undefined)
  );

export const fetchBase = (o?: FrontendOptions): AxiosInstance =>
  axios.create({
    headers: headers(o),
    signal: o?.signal,
  });

// --- USEFUL TYPES ---

export const SpaceIdParam = z.object({ spaceId: Space.shape.spaceId });
export type SpaceIdParam = z.infer<typeof SpaceIdParam>;

export const SheetIdParam = z.object({ sheetId: Sheet.shape.sheetId });
export type SheetIdParam = z.infer<typeof SheetIdParam>;

export const GroupIdParam = z.object({ groupId: Group.shape.groupId });
export type GroupIdParam = z.infer<typeof GroupIdParam>;

export const ItemIdParam = z.object({ itemId: ItemBase.shape.itemId });
export type ItemIdParam = z.infer<typeof ItemIdParam>;
