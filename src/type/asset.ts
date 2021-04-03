import * as t from "zod";

// ASSET

export const GetAssetQuery = t.object({
  assetId: t.string().uuid(),
});
export type GetAssetQuery = t.infer<typeof GetAssetQuery>;

export const GetAssetHeaders = t
  .object({
    range: t.string(),
    "if-modified-since": t.string().transform((v) => new Date(v)),
    "if-none-match": t.string(),
  })
  .partial();
export type GetAssetHeaders = t.infer<typeof GetAssetHeaders>;

export const PostAssetQuery = t.object({
  spaceId: t.string().uuid(),
});
export type PostAssetQuery = t.infer<typeof PostAssetQuery>;
