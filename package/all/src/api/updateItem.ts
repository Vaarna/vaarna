import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import {
  getUpdated,
  Item,
  parseBody,
  RequestWithBody,
  UpdateItem,
} from "@gm-screen/type";

import {
  CommonBackendConfig,
  createDynamoDbUpdate,
  DynamoDbConfig,
  fetchBase,
  FrontendOptions,
} from "./common";

const Output = Item;
type Output = Item;

const fs = {
  backend: {
    updateItem: async (
      req: CommonBackendConfig & RequestWithBody,
      c: DynamoDbConfig
    ): Promise<Output> => {
      const body = parseBody(req, UpdateItem);

      const cmd = new UpdateItemCommand({
        TableName: c.tableName,
        Key: marshall({
          pk: `space:${body.spaceId}`,
          sk: `item:${body.itemId}`,
        }),
        ReturnValues: "ALL_NEW",
        ...createDynamoDbUpdate(req, { ...body, ...getUpdated() }, [
          "spaceId",
          "sheetId",
          "itemId",
        ]),
      });

      const res = await c.db.send(cmd);
      return Output.parse(unmarshall(res.Attributes ?? {}));
    },
  },

  frontend: {
    updateItem: async (item: UpdateItem, o?: FrontendOptions): Promise<Output> => {
      const res = await fetchBase(o).patch("/api/space/item", item);
      return Output.parse(res.data);
    },
  },
};

export default fs;
