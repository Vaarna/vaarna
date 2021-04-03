import { z } from "zod";

// ASSET

export const GetAssetQuery = z.object({
  assetId: z.string().uuid(),
});
export type GetAssetQuery = z.infer<typeof GetAssetQuery>;

export const GetAssetHeaders = z
  .object({
    range: z.string(),
    "if-modified-since": z.string().transform((v) => new Date(v)),
    "if-none-match": z.string(),
  })
  .partial();
export type GetAssetHeaders = z.infer<typeof GetAssetHeaders>;

export const PostAssetQuery = z.object({
  spaceId: z.string().uuid(),
});
export type PostAssetQuery = z.infer<typeof PostAssetQuery>;
