import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

import {
  CreateSpace,
  getCreatedUpdated,
  parseBody,
  RequestWithBody,
  Space,
} from "@gm-screen/type";

import { uuid } from "../util/uuid";
import { DynamoDbConfig, fetchBase, FrontendOptions } from "./common";

const Output = Space;
type Output = Space;

const fs = {
  backend: {
    createSpace: async (req: RequestWithBody, c: DynamoDbConfig): Promise<Output> => {
      const body = parseBody(req, CreateSpace);

      const spaceId = uuid();
      const item = {
        ...body,
        ...getCreatedUpdated(),
        spaceId,
      };

      const cmd = new PutItemCommand({
        TableName: c.tableName,
        Item: marshall({ ...item, pk: `space:${spaceId}`, sk: "data" }),
      });

      await c.db.send(cmd);

      return item;
    },
  },

  frontend: {
    createSpace: async (sheet: CreateSpace, o?: FrontendOptions): Promise<Output> => {
      const res = await fetchBase(o).post("/api/space", sheet);

      return Output.parse(res.data);
    },
  },
};

export default fs;
