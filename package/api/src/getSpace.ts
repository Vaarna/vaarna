import {
  ApiNotFoundError,
  Group,
  Item,
  parseQuery,
  RequestWithQuery,
  Sheet,
  Space,
} from "@vaarna/type";
import { z } from "zod";

import { DynamoDbConfig, fetchBase, FrontendOptions, getItemsFromTable } from "./util";

class InvalidSpaceItem extends Error {
  constructor(
    public readonly pk: string,
    public readonly sk: string,
    public readonly data: unknown
  ) {
    super(`cannot parse space item with sk ${sk}`);
  }
}

// TODO: move this to a better place
const pksk = z
  .object({
    pk: z.string(),
    sk: z.string(),
  })
  .passthrough();

const parseSpaceElement = (
  v: unknown
):
  | { type: "space"; value: Space }
  | { type: "sheet"; value: Sheet }
  | { type: "group"; value: Group }
  | { type: "item"; value: Item } => {
  const parsed = pksk.parse(v);

  if (parsed.sk === "data") {
    return { type: "space", value: Space.parse(parsed) };
  }

  if (parsed.sk.startsWith("sheet:")) {
    return { type: "sheet", value: Sheet.parse(parsed) };
  }

  if (parsed.sk.startsWith("group:")) {
    return { type: "group", value: Group.parse(parsed) };
  }

  if (parsed.sk.startsWith("item:")) {
    return { type: "item", value: Item.parse(parsed) };
  }

  throw new InvalidSpaceItem(parsed.pk, parsed.sk, parsed);
};

const Output = z.object({
  space: Space,
  sheets: z.array(Sheet),
  groups: z.array(Group),
  items: z.array(Item),
});
type Output = z.infer<typeof Output>;

const fs = {
  backend: {
    getSpace: async (req: RequestWithQuery, c: DynamoDbConfig): Promise<Output> => {
      const { spaceId } = parseQuery(req, z.object({ spaceId: Space.shape.spaceId }));

      const res = await getItemsFromTable(c.db, {
        tableName: c.tableName,
        pk: { prefix: "space:", value: spaceId },
        sk: { value: null },
      });

      let space: Space | undefined;
      const out: Omit<Output, "space"> = {
        sheets: [],
        groups: [],
        items: [],
      };

      for (const v of res) {
        const el = parseSpaceElement(v);
        if (el.type === "space") space = el.value;
        if (el.type === "sheet") out.sheets.push(el.value);
        if (el.type === "group") out.groups.push(el.value);
        if (el.type === "item") out.items.push(el.value);
      }

      if (space === undefined)
        throw new ApiNotFoundError(c.requestId, "space not found");

      return { ...out, space };
    },
  },

  frontend: {
    getSpace: async (
      spaceId: Space["spaceId"],
      o?: FrontendOptions
    ): Promise<Output> => {
      const res = await fetchBase(o).get("/api/space", { params: { spaceId } });
      return Output.parse(res.data);
    },
  },
};

export default fs;
