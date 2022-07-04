import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

import { CommonBackendConfig } from "./commonBackendConfig";

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
