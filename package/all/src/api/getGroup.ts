import { ApiNotFoundError, Group, RequestWithQuery, parseQuery } from "@gm-screen/type";
import { getItemsFromTable } from "../util/dynamodb";
import {
  DynamoDbConfig,
  FrontendOptions,
  GroupIdParam,
  SpaceIdParam,
  fetchBase,
} from "./common";

const Output = Group;
type Output = Group;

const fs = {
  backend: {
    getGroup: async (req: RequestWithQuery, c: DynamoDbConfig): Promise<Output> => {
      const { spaceId, groupId } = parseQuery(req, SpaceIdParam.and(GroupIdParam));

      const items = await getItemsFromTable(c.db, {
        tableName: c.tableName,
        pk: { prefix: "space:", value: spaceId },
        sk: { prefix: "group:", value: groupId },
      });

      if (items.length === 0) throw new ApiNotFoundError(c.requestId, "item not found");

      return Output.parse(items[0]);
    },
  },

  frontend: {
    getGroup: async (
      { spaceId, groupId }: SpaceIdParam & GroupIdParam,
      o?: FrontendOptions
    ): Promise<Output> => {
      const res = await fetchBase(o).get("/api/space/group", {
        params: { spaceId, groupId },
      });

      return Output.parse(res.data);
    },
  },
};

export default fs;
