import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  CreateItem,
  Item,
  getCreatedUpdated,
  RequestWithBody,
  RequestWithQuery,
  parseBody,
} from "@gm-screen/type";
import { uuid } from "../util/uuid";
import { DynamoDbConfig, FrontendOptions, fetchBase } from "./common";

const Output = Item;
type Output = Item;

const fs = {
  backend: {
    createItem: async (
      req: RequestWithQuery & RequestWithBody,
      c: DynamoDbConfig
    ): Promise<Output> => {
      const body = parseBody(req, CreateItem);

      const itemId = uuid();

      const item: Item = {
        ...body,
        ...getCreatedUpdated(),
        itemId,
      };

      const cmd = new PutItemCommand({
        TableName: c.tableName,
        Item: marshall({
          ...item,
          pk: `space:${body.spaceId}`,
          sk: `item:${itemId}`,
        }),
      });

      await c.db.send(cmd);

      return item;
    },
  },

  frontend: {
    createItem: async (sheet: CreateItem, o?: FrontendOptions): Promise<Output> => {
      const res = await fetchBase(o).post("/api/space/item", sheet);
      return Output.parse(res.data);
    },
  },
};

export default fs;
