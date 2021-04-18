import { z } from "zod";

const LogEventBase = z.object({
  spaceId: z.string().uuid(),
});

export const LogEvent = z.union([
  LogEventBase.extend({
    type: z.literal("MESSAGE"),
    msg: z.string(),
  }),
  LogEventBase.extend({
    type: z.literal("ROLL"),
    expr: z.string(),
  }),
]);
export type LogEvent = z.infer<typeof LogEvent>;

export const LogItem = z.object({
  spaceId: z.string().uuid(),
  messageId: z.string().uuid(),
  t: z.number(),
  msg: z.string(),
  expr: z.string().optional(),
});
export type LogItem = z.infer<typeof LogItem>;

export const LogItems = z.array(LogItem);
export type LogItems = z.infer<typeof LogItems>;

export const GetLogQuery = z.object({
  spaceId: z.string().uuid(),
});
export type GetLogQuery = z.infer<typeof GetLogQuery>;
