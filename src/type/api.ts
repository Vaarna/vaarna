import * as t from "zod";

// ASSET

export const GetAssetQuery = t.object({
  assetId: t.string(),
});
export type GetAssetQuery = t.infer<typeof GetAssetQuery>;

export const GetAssetHeaders = t.object({
  range: t.string().optional(),
  "if-modified-since": t
    .string()
    .transform((v) => new Date(v))
    .optional(),
  "if-none-match": t.string().optional(),
});
export type GetAssetHeaders = t.infer<typeof GetAssetHeaders>;

// ITEM

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
