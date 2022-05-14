import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import axios, { AxiosInstance } from "axios";
import P from "pino";
import config from "config";
import { Sheet, Space } from "type/space";
import { RequestWithLogger } from "util/withDefaults";
import { z } from "zod";
import { asAWSLogger } from "logger";

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
