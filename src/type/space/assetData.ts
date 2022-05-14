import { z } from "zod";
import { Space } from "./space";

export const AssetDataKind = z.enum(["image", "video", "audio", "pdf", "other"]);
export type AssetDataKind = z.infer<typeof AssetDataKind>;

export const AssetData = z.object({
  spaceId: Space.shape.spaceId,
  assetId: z.string().uuid(),
  size: z.number().int(),
  contentType: z.string(),
  filename: z.string(),
  kind: AssetDataKind,
});
export type AssetData = z.infer<typeof AssetData>;
