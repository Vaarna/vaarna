import { z } from "zod";

export const SpaceItem = z
  .object({
    spaceId: z.string().uuid(),
    sk: z.string(),
  })
  .passthrough();
export type SpaceItem = z.infer<typeof SpaceItem>;
