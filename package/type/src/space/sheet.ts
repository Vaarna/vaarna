import { z } from "zod";

import { CreatedUpdated, OmitCreatedUpdated } from "../createdUpdated";
import { Space } from "./space";

export const Sheet = z
  .object({
    spaceId: Space.shape.spaceId,
    sheetId: z.string().uuid(),
    name: z.string(),
  })
  .merge(CreatedUpdated);
export type Sheet = z.infer<typeof Sheet>;

export const CreateSheet = Sheet.omit({ sheetId: true, ...OmitCreatedUpdated });
export type CreateSheet = z.infer<typeof CreateSheet>;

export const UpdateSheet = Sheet.pick({ spaceId: true, sheetId: true }).and(
  Sheet.omit({ ...OmitCreatedUpdated }).partial()
);
export type UpdateSheet = z.infer<typeof UpdateSheet>;

export const RemoveSheet = Sheet.pick({ spaceId: true, sheetId: true });
export type RemoveSheet = z.infer<typeof RemoveSheet>;
