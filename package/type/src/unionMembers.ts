import { z } from "zod";

type literals = string | number | boolean;

export const unionMembers = <
  Z extends z.ZodUnion<
    [z.ZodLiteral<literals>, z.ZodLiteral<literals>, ...z.ZodLiteral<literals>[]]
  >
>(
  t: Z
): z.infer<Z>[] => t._def.options.map((v) => v.value);
