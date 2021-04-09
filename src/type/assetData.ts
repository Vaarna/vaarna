import { z } from "zod";

export const Kind = z.enum(["image", "video", "audio", "pdf", "other"]);
export type Kind = z.infer<typeof Kind>;

export const AssetData = z.object({
  spaceId: z.string().uuid(),
  assetId: z.string().uuid(),
  size: z.number().int(),
  contentType: z.string(),
  filename: z.string(),
  kind: Kind,
});
export type AssetData = z.infer<typeof AssetData>;

export const AssetDatas = z.array(AssetData);
export type AssetDatas = z.infer<typeof AssetDatas>;

export const GetAssetDataQuery = z.object({
  spaceId: z.string().uuid(),
  assetId: z.union([z.undefined(), z.string().uuid(), z.array(z.string().uuid())]),
});
export type GetAssetDataQuery = z.infer<typeof GetAssetDataQuery>;
