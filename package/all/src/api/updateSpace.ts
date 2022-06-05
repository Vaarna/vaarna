import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  Space,
  UpdateSpace,
  getUpdated,
  RequestWithBody,
  parseBody,
} from "@gm-screen/type";
import {
  CommonBackendConfig,
  DynamoDbConfig,
  FrontendOptions,
  createDynamoDbUpdate,
  fetchBase,
} from "./common";

const Output = Space;
type Output = Space;

const fs = {
  backend: {
    updateSpace: async (
      req: CommonBackendConfig & RequestWithBody,
      c: DynamoDbConfig
    ): Promise<Output> => {
      const body = parseBody(req, UpdateSpace);

      const cmd = new UpdateItemCommand({
        TableName: c.tableName,
        Key: marshall({
          pk: `space:${body.spaceId}`,
          sk: `data`,
        }),
        ReturnValues: "ALL_NEW",
        ...createDynamoDbUpdate(req, { ...body, ...getUpdated() }, ["spaceId"]),
      });

      const res = await c.db.send(cmd);
      return Output.parse(unmarshall(res.Attributes ?? {}));
    },
  },

  frontend: {
    updateSpace: async (space: UpdateSpace, o?: FrontendOptions): Promise<Output> => {
      const res = await fetchBase(o).patch("/api/space", space);
      return Output.parse(res.data);
    },
  },
};

export default fs;
