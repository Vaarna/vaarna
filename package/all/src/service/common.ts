import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import P from "pino";

import { asAWSLogger } from "@gm-screen/logging";

import config from "../config";

export const dynamoDbConfig = (logger: P.Logger): DynamoDBClientConfig => ({
  logger: asAWSLogger("DynamoDB", logger),
  endpoint: config.DYNAMODB_ENDPOINT,
});

export const s3Config = (logger: P.Logger): S3ClientConfig => ({
  endpoint: config.S3_ENDPOINT,
  forcePathStyle: config.S3_FORCE_PATH_STYLE,
  logger: asAWSLogger("S3", logger),
});

export type ServiceParams = {
  logger: P.Logger;
  requestId: string;
};

export class Service {
  protected readonly logger: P.Logger;
  protected readonly requestId: string;

  constructor(params: ServiceParams, loggerBindings: Record<string, unknown>) {
    this.logger = params.logger.child(loggerBindings);
    this.requestId = params.requestId;
  }
}
