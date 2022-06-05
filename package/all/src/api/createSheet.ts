import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

import {
  CreateSheet,
  getCreatedUpdated,
  parseBody,
  RequestWithBody,
  Sheet,
} from "@gm-screen/type";

import { uuid } from "../util/uuid";
import { DynamoDbConfig, fetchBase, FrontendOptions } from "./common";

const Output = Sheet;
type Output = Sheet;

const fs = {
  backend: {
    createSheet: async (req: RequestWithBody, c: DynamoDbConfig): Promise<Output> => {
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
          pk: `space:${body.spaceId}`,
          sk: `sheet:${sheetId}`,
        }),
      });

      await c.db.send(cmd);

      return sheet;
    },
  },

  frontend: {
    createSheet: async (sheet: CreateSheet, o?: FrontendOptions): Promise<Output> => {
      const res = await fetchBase(o).post("/api/space/sheet", sheet);

      return Output.parse(res.data);
    },
  },
};

export default fs;
