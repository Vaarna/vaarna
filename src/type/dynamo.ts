import { z } from "zod";

const nameUuid = (name: string) => (v: string) => {
  if (!v.startsWith(`${name}:`)) return false;

  const splitted = v.split(":");
  if (splitted.length !== 2) return false;

  const p = z.string().uuid().safeParse(splitted[1]);
  if (!p.success) return false;

  return true;
};

export const PKSK = (
  pkName: string,
  skName: string
): z.ZodObject<
  {
    pk: z.ZodEffects<z.ZodString, string>;
    sk: z.ZodEffects<z.ZodString, string>;
  },
  "passthrough"
> =>
  z
    .object({
      pk: z.string().refine(nameUuid(pkName)),
      sk: z.string().refine(nameUuid(skName)),
    })
    .passthrough();

export type WithPKSK<T> = T & { pk: string; sk: string };
export type WithoutPKSK<T> = Omit<T, "pk" | "sk">;
