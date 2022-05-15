import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Sheet, Space, UpdateSheet } from "type/space";
import {
  parseBody,
  parseQuery,
  RequestWithBody,
  RequestWithQuery,
} from "util/parseRequest";
import { z } from "zod";
import { DynamoDbConfig, FrontendOptions, fetchBase } from "./common";

function f(v: Record<string, string>, ignoreKeys?: string[]) {
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, string> = {};
  const ks: Record<string, string> = {};

  for (const [key, value] of Object.entries(v)) {
    if (ignoreKeys?.includes(key)) continue;

    ExpressionAttributeNames[`#${key}`] = key;
    ExpressionAttributeValues[`:${key}`] = value;
    ks[`#${key}`] = `:${key}`;
  }

  const UpdateExpression = Object.entries(ks)
    .map(([k, v]) => `SET ${k} = ${v}`)
    .join(", ");

  return {
    ExpressionAttributeNames,
    ExpressionAttributeValues: marshall(ExpressionAttributeValues),
    UpdateExpression,
  };
}

const Output = Sheet;
type Output = Sheet;

const fs = {
  backend: {
    updateSheet: async (
      req: RequestWithQuery & RequestWithBody,
      c: DynamoDbConfig
    ): Promise<Output> => {
      const { spaceId } = parseQuery(req, z.object({ spaceId: Space.shape.spaceId }));
      const body = parseBody(req, UpdateSheet);

      const cmd = new UpdateItemCommand({
        TableName: c.tableName,
        Key: marshall({
          pk: `space:${spaceId}`,
          sk: `sheet:${body.sheetId}`,
        }),
        ReturnValues: "ALL_NEW",
        ...f(body, ["sheetId"]),
      });

      const res = await c.db.send(cmd);
      return Output.parse(unmarshall(res.Attributes ?? {}));
    },
  },

  frontend: {
    updateSheet: async (
      { spaceId, sheet }: { spaceId: Space["spaceId"]; sheet: UpdateSheet },
      o?: FrontendOptions
    ): Promise<Output> => {
      const res = await fetchBase(o).patch("/api/space/sheet", sheet, {
        params: { spaceId },
      });
      return Output.parse(res.data);
    },
  },
};

export default fs;
