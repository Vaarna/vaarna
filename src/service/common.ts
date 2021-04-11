import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { asAWSLogger } from "logger";
import P from "pino";
import { envGetBool } from "util/env";

export const dynamoDbConfig = (logger: P.Logger): DynamoDBClientConfig => ({
  logger: asAWSLogger("DynamoDB", logger),
  endpoint: process.env.DYNAMODB_ENDPOINT,
});

export const s3Config = (logger: P.Logger): S3ClientConfig => ({
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: envGetBool("S3_FORCE_PATH_STYLE", false),
  logger: asAWSLogger("S3", logger),
});

export type ServiceConfig = {
  logger: P.Logger;
  requestId: string;
};

export class Service {
  protected readonly logger: P.Logger;
  protected readonly requestId: string;

  constructor(config: ServiceConfig, loggerBindings: Record<string, unknown>) {
    this.logger = config.logger.child(loggerBindings);
    this.requestId = config.requestId;
  }
}
