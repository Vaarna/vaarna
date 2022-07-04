import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import {
  getUpdated,
  parseBody,
  RequestWithBody,
  Sheet,
  UpdateSheet,
} from "@gm-screen/type";

import {
  CommonBackendConfig,
  createDynamoDbUpdate,
  DynamoDbConfig,
  fetchBase,
  FrontendOptions,
} from "./util";

const Output = Sheet;
type Output = Sheet;

const fs = {
  backend: {
    updateSheet: async (
      req: CommonBackendConfig & RequestWithBody,
      c: DynamoDbConfig
    ): Promise<Output> => {
      const body = parseBody(req, UpdateSheet);

      const cmd = new UpdateItemCommand({
        TableName: c.tableName,
        Key: marshall({
          pk: `space:${body.spaceId}`,
          sk: `sheet:${body.sheetId}`,
        }),
        ReturnValues: "ALL_NEW",
        ...createDynamoDbUpdate(req, { ...body, ...getUpdated() }, [
          "spaceId",
          "sheetId",
        ]),
      });

      const res = await c.db.send(cmd);
      return Output.parse(unmarshall(res.Attributes ?? {}));
    },
  },

  frontend: {
    updateSheet: async (sheet: UpdateSheet, o?: FrontendOptions): Promise<Output> => {
      const res = await fetchBase(o).patch("/api/space/sheet", sheet);
      return Output.parse(res.data);
    },
  },
};

export default fs;
