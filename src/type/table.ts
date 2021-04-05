import { z } from "zod";

export const Table = z.object({
  spaceId: z.string().uuid(),
  updated: z.string(),
  assetId: z.string().uuid(),
});
export type Table = z.infer<typeof Table>;

export const GetTableQuery = z.object({
  spaceId: z.string().uuid(),
});
export type GetTableQuery = z.infer<typeof GetTableQuery>;

export const UpdateTableBody = Table.omit({ updated: true });
export type UpdateTableBody = z.infer<typeof UpdateTableBody>;
