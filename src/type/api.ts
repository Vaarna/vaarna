import * as t from "zod";

export const GetItemsQuery = t.object({
  spaceId: t.string().uuid(),
  itemId: t.union([
    t.undefined(),
    t.string().uuid(),
    t.array(t.string().uuid()),
  ]),
});
export type GetItemsQuery = t.infer<typeof GetItemsQuery>;

export const RemoveItemQuery = t.object({
  spaceId: t.string().uuid(),
  itemId: t.string().uuid(),
  version: t.string().regex(/^\d+$/),
});
export type RemoveItemQuery = t.infer<typeof RemoveItemQuery>;
