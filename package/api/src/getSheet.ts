import { z } from "zod";

import { ApiNotFoundError, parseQuery, RequestWithQuery, Sheet } from "@gm-screen/type";

import { SheetIdParam, SpaceIdParam } from "./common";
import { DynamoDbConfig, fetchBase, FrontendOptions, getItemsFromTable } from "./util";

const Output = z.object({ sheet: Sheet });
type Output = z.infer<typeof Output>;

const fs = {
  backend: {
    getSheet: async (req: RequestWithQuery, c: DynamoDbConfig): Promise<Output> => {
      const { spaceId, sheetId } = parseQuery(req, SpaceIdParam.merge(SheetIdParam));

      const items = await getItemsFromTable(c.db, {
        tableName: c.tableName,
        pk: { prefix: "space:", value: spaceId },
        sk: { prefix: "sheet:", value: sheetId },
      });

      if (items.length === 0)
        throw new ApiNotFoundError(c.requestId, "sheet not found");

      const sheet = Sheet.parse(items[0]);
      return { sheet };
    },
  },

  frontend: {
    getSheet: async (
      { spaceId, sheetId }: SpaceIdParam & SheetIdParam,
      o?: FrontendOptions
    ): Promise<Output> => {
      const res = await fetchBase(o).get("/api/space/sheet", {
        params: { spaceId, sheetId },
      });

      return Output.parse(res.data);
    },
  },
};

export default fs;
