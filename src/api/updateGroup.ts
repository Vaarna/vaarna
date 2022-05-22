import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Group, UpdateGroup } from "type/space";
import { getUpdated } from "type/createdUpdated";
import { parseBody, RequestWithBody } from "util/parseRequest";
import {
  DynamoDbConfig,
  FrontendOptions,
  fetchBase,
  createDynamoDbUpdate,
} from "./common";

const Output = Group;
type Output = Group;

const fs = {
  backend: {
    updateGroup: async (req: RequestWithBody, c: DynamoDbConfig): Promise<Output> => {
      const body = parseBody(req, UpdateGroup);

      const cmd = new UpdateItemCommand({
        TableName: c.tableName,
        Key: marshall({
          pk: `space:${body.spaceId}`,
          sk: `group:${body.groupId}`,
        }),
        ReturnValues: "ALL_NEW",
        ...createDynamoDbUpdate(c, { ...body, ...getUpdated() }, [
          "spaceId",
          "sheetId",
          "groupId",
        ]),
      });

      const res = await c.db.send(cmd);
      return Output.parse(unmarshall(res.Attributes ?? {}));
    },
  },

  frontend: {
    updateGroup: async (group: UpdateGroup, o?: FrontendOptions): Promise<Output> => {
      console.log("updategroup", group);
      const res = await fetchBase(o).patch("/api/space/group", group);
      return Output.parse(res.data);
    },
  },
};

export default fs;
