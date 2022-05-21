import { z } from "zod";

export const CreatedUpdated = z.object({
  created: z.number(),
  updated: z.number(),
});
export type CreatedUpdated = z.infer<typeof CreatedUpdated>;

export const OmitCreatedUpdated = { created: true, updated: true } as const;

export const getCreatedUpdated = (): CreatedUpdated => {
  const created = new Date().getTime();
  const updated = created;
  return { created, updated };
};

export const getUpdated = (): Pick<CreatedUpdated, "updated"> => {
  const updated = new Date().getTime();
  return { updated };
};
