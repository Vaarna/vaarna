import { z } from "zod";

export const TableMessage = z.object({
  id: z.string().uuid(),
  t: z.string(),
  msg: z.string(),
});
export type TableMessage = z.infer<typeof TableMessage>;

export const Table = z.object({
  spaceId: z.string().uuid(),
  updated: z.string(),
  assetId: z.string().uuid().nullable(),
  messages: z.array(TableMessage),
});
export type Table = z.infer<typeof Table>;

export const GetTableQuery = z.object({
  spaceId: z.string().uuid(),
});
export type GetTableQuery = z.infer<typeof GetTableQuery>;

export const UpdateTableBody = Table.omit({ updated: true });
export type UpdateTableBody = z.infer<typeof UpdateTableBody>;

const TableEventBase = z.object({
  spaceId: z.string().uuid(),
});

export const TableEventNewMessage = TableEventBase.extend({
  type: z.literal("NEW_MESSAGE"),
  content: z.string(),
});
export type TableEventNewMessage = z.infer<typeof TableEventNewMessage>;

export const TableEventEval = TableEventBase.extend({
  type: z.literal("EVAL"),
  expr: z.string(),
});
export type TableEventEval = z.infer<typeof TableEventEval>;

export const UpdateTableEvent = z.union([TableEventNewMessage, TableEventEval]);
export type UpdateTableEvent = z.infer<typeof UpdateTableEvent>;
