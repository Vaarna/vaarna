import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Sheet, Space, UpdateSheet } from "type/space";
import { getUpdated } from "type/createdUpdated";
import {
  parseBody,
  parseQuery,
  RequestWithBody,
  RequestWithQuery,
} from "util/parseRequest";
import { DynamoDbConfig, FrontendOptions, fetchBase, SpaceIdParam } from "./common";

function f(v: Record<string, string | number>, ignoreKeys?: string[]) {
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, string | number> = {};
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

  console.log("constructed UpdateItem parameters", out);

  return out;
}

const Output = Sheet;
type Output = Sheet;

const fs = {
  backend: {
    updateSheet: async (
      req: RequestWithQuery & RequestWithBody,
      c: DynamoDbConfig
    ): Promise<Output> => {
      const { spaceId } = parseQuery(req, SpaceIdParam);
      const body = parseBody(req, UpdateSheet);

      const cmd = new UpdateItemCommand({
        TableName: c.tableName,
        Key: marshall({
          pk: `space:${spaceId}`,
          sk: `sheet:${body.sheetId}`,
        }),
        ReturnValues: "ALL_NEW",
        ...f({ ...body, ...getUpdated() }, ["sheetId"]),
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
