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

export function getKind(contentType: string): AssetData["kind"] {
  // eslint-disable-next-line default-case
  switch (contentType) {
    case "application/pdf":
      return "pdf";
  }

  const split = contentType.split("/");

  if (split.length !== 2) return "other";

  const [lhs, _rhs] = split;
  // eslint-disable-next-line default-case
  switch (lhs) {
    case "audio":
    case "video":
    case "image":
      return lhs;
  }

  return "other";
}
