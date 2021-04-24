import { z } from "zod";

export const ProfileGoogle = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
    picture: z.string().url().optional(),
  })
  .passthrough();
export type ProfileGoogle = z.infer<typeof ProfileGoogle>;

export const User = z.object({
  userId: z.string().email(),
  sk: z.literal("user"),
  created: z.number(),
  updated: z.number(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().url().optional(),
});
export type User = z.infer<typeof User>;
