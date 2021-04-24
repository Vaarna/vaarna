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

export const Account = z.object({
  userId: z.string().email(),
  sk: z.string(),
  created: z.number(),
  updated: z.number(),
  profile: z.record(z.unknown()),
  tokens: z.record(z.unknown()),
});
export type Account = z.infer<typeof Account>;

export const Session = z.object({
  userId: z.string().email(),
  sk: z.string(),
  sessionId: z.string().uuid(),
  userAgent: z.string().optional(),
  created: z.number(),
});
export type Session = z.infer<typeof Session>;
