import { z } from "zod";

export const callIfParsed =
  <T extends unknown>(t: z.ZodType<T>, f: (a: T) => void) =>
  (v: unknown): void => {
    const parsed = t.safeParse(v);
    if (parsed.success) f(parsed.data);
  };

type literals = string | number | boolean;

export const unionMembers = <
  Z extends z.ZodUnion<
    [z.ZodLiteral<literals>, z.ZodLiteral<literals>, ...z.ZodLiteral<literals>[]]
  >
>(
  t: Z
): z.infer<Z>[] => t._def.options.map((v) => v.value);
