import z from "zod";

export const Space = z.object({
  spaceId: z.string().uuid(),
  name: z.string(),
});
export type Space = z.infer<typeof Space>;

export const CreateSpace = Space.omit({ spaceId: true });
export type CreateSpace = z.infer<typeof CreateSpace>;

export const UpdateSpace = Space.pick({ spaceId: true }).and(Space.partial());
export type UpdateSpace = z.infer<typeof UpdateSpace>;

export const RemoveSpace = Space.pick({ spaceId: true });
export type RemoveSpace = z.infer<typeof RemoveSpace>;
