import { ApiNotFoundError, Item, parseQuery, RequestWithQuery } from "@gm-screen/type";

import { ItemIdParam, SpaceIdParam } from "./common";
import { DynamoDbConfig, fetchBase, FrontendOptions, getItemsFromTable } from "./util";

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
