import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

import {
  CreateGroup,
  getCreatedUpdated,
  Group,
  parseBody,
  RequestWithBody,
} from "@vaarna/type";
import { uuid } from "@vaarna/util";

import { DynamoDbConfig, fetchBase, FrontendOptions } from "./util";

const Output = Group;
type Output = Group;

const fs = {
  backend: {
    createGroup: async (req: RequestWithBody, c: DynamoDbConfig): Promise<Output> => {
      const body = parseBody(req, CreateGroup);

      const groupId = uuid();

      const group: Group = {
        ...body,
        ...getCreatedUpdated(),
        groupId,
      };

      const cmd = new PutItemCommand({
        TableName: c.tableName,
        Item: marshall({
          ...group,
          pk: `space:${body.spaceId}`,
          sk: `group:${groupId}`,
        }),
      });

      await c.db.send(cmd);

      return group;
    },
  },

  frontend: {
    createGroup: async (group: CreateGroup, o?: FrontendOptions): Promise<Output> => {
      const res = await fetchBase(o).post("/api/space/group", group);
      return Output.parse(res.data);
    },
  },
};

export default fs;
