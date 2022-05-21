import { ApiNotFoundError } from "type/error";
import { Item } from "type/space";
import { getItemsFromTable } from "util/dynamodb";
import { parseQuery, RequestWithQuery } from "util/parseRequest";
import {
  DynamoDbConfig,
  FrontendOptions,
  fetchBase,
  SpaceIdParam,
  ItemIdParam,
} from "./common";

const Output = Item;
type Output = Item;

const fs = {
  backend: {
    getItem: async (req: RequestWithQuery, c: DynamoDbConfig): Promise<Output> => {
      const { spaceId, itemId } = parseQuery(req, SpaceIdParam.and(ItemIdParam));

      const items = await getItemsFromTable(c.db, {
        tableName: c.tableName,
        pk: { prefix: "space:", value: spaceId },
        sk: { prefix: "item:", value: itemId },
      });

      if (items.length === 0) throw new ApiNotFoundError(c.requestId, "item not found");

      return Item.parse(items[0]);
    },
  },

  frontend: {
    getItem: async (
      { spaceId, itemId }: SpaceIdParam & ItemIdParam,
      o?: FrontendOptions
    ): Promise<Output> => {
      const res = await fetchBase(o).get("/api/space/item", {
        params: { spaceId, itemId },
      });

      return Output.parse(res.data);
    },
  },
};

export default fs;
