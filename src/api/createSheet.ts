import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { CreateSheet, Sheet } from "type/space";
import { getCreatedUpdated } from "type/createdUpdated";
import {
  parseBody,
  parseQuery,
  RequestWithBody,
  RequestWithQuery,
} from "util/parseRequest";
import { uuid } from "util/uuid";
import { z } from "zod";
import { DynamoDbConfig, FrontendOptions, fetchBase, SpaceIdParam } from "./common";

const Output = z.object({ sheet: Sheet });
type Output = z.infer<typeof Output>;

const fs = {
  backend: {
    createSheet: async (
      req: RequestWithQuery & RequestWithBody,
      c: DynamoDbConfig
    ): Promise<Output> => {
      const { spaceId } = parseQuery(req, SpaceIdParam);
      const body = parseBody(req, CreateSheet);

      const sheetId = uuid();

      const sheet: Sheet = {
        ...body,
        ...getCreatedUpdated(),
        sheetId,
      };

      const cmd = new PutItemCommand({
        TableName: c.tableName,
        Item: marshall({
          ...sheet,
          pk: `space:${spaceId}`,
          sk: `sheet:${sheetId}`,
        }),
      });

      await c.db.send(cmd);

      return { sheet };
    },
  },

  frontend: {
    createSheet: async (
      { spaceId, sheet }: SpaceIdParam & { sheet: CreateSheet },
      o?: FrontendOptions
    ): Promise<Output> => {
      const res = await fetchBase(o).post("/api/space/sheet", sheet, {
        params: { spaceId },
      });

      return Output.parse(res.data);
    },
  },
};

export default fs;
