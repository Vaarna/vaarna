import { z } from "zod";
import { PKSK } from "./dynamo";

export const Asset = PKSK("space", "asset").merge(
  z.object({
    spaceId: z.string().uuid(),
    assetId: z.string().uuid(),
  })
);
export type Asset = z.infer<typeof Asset>;

export const Sheet = PKSK("space", "sheet").merge(
  z.object({
    spaceId: z.string().uuid(),
    sheetId: z.string().uuid(),
  })
);
export type Sheet = z.infer<typeof Sheet>;

export const Log = PKSK("space", "log").merge(
  z.object({
    spaceId: z.string().uuid(),
    logId: z.string().uuid(),
  })
);
export type Log = z.infer<typeof Log>;

export const Item = PKSK("sheet", "item").merge(
  z.object({
    sheetId: z.string().uuid(),
    itemId: z.string().uuid(),
  })
);
export type Item = z.infer<typeof Item>;

export const Group = PKSK("sheet", "group").merge(
  z.object({
    sheetId: z.string().uuid(),
    groupId: z.string().uuid(),
  })
);
export type Group = z.infer<typeof Group>;
