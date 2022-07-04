import z from "zod";
import { CreatedUpdated, OmitCreatedUpdated } from "../createdUpdated";

export const Space = z
  .object({
    spaceId: z.string().uuid(),
    name: z.string(),
  })
  .merge(CreatedUpdated);
export type Space = z.infer<typeof Space>;

export const CreateSpace = Space.omit({ spaceId: true, ...OmitCreatedUpdated });
export type CreateSpace = z.infer<typeof CreateSpace>;

export const UpdateSpace = Space.pick({ spaceId: true }).and(
  Space.omit(OmitCreatedUpdated).partial()
);
export type UpdateSpace = z.infer<typeof UpdateSpace>;

export const RemoveSpace = Space.pick({ spaceId: true });
export type RemoveSpace = z.infer<typeof RemoveSpace>;
