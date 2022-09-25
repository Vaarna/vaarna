import { z } from "zod";

export const callIfParsed =
  <T>(t: z.ZodType<T>, f: (a: T) => void) =>
  (v: unknown): void => {
    const parsed = t.safeParse(v);
    if (parsed.success) f(parsed.data);
  };
