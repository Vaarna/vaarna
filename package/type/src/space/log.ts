import { z } from "zod";

import { Space } from "./space";

export const LogItem = z.object({
  spaceId: Space.shape.spaceId,
  logId: z.string().uuid(),
  t: z.number(),
  msg: z.string(),
});
export type LogItem = z.infer<typeof LogItem>;
