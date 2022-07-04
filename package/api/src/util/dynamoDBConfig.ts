import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import type P from "pino";

import { asAWSLogger, RequestWithLogger } from "@gm-screen/logging";

import {
  CommonBackendConfig,
  commonBackendConfigFromRequest,
} from "./commonBackendConfig";
import { DYNAMODB_ENDPOINT, TABLE_NAME } from "./config";

export const dynamoDbConfig = (logger: P.Logger): DynamoDBClientConfig => ({
  logger: asAWSLogger("DynamoDB", logger),
  endpoint: DYNAMODB_ENDPOINT,
});

export type DynamoDbConfig = CommonBackendConfig & {
  db: DynamoDBClient;
  tableName: string;
};

export const dynamoDbConfigFromRequest = (req: RequestWithLogger): DynamoDbConfig => {
  const c = commonBackendConfigFromRequest(req);

  return {
    ...c,
    db: new DynamoDBClient(dynamoDbConfig(c.logger)),
    tableName: TABLE_NAME,
  };
};
