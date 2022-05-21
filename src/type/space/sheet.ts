import z from "zod";
import { CreatedUpdated, OmitCreatedUpdated } from "../createdUpdated";

export const Sheet = z
  .object({
    sheetId: z.string().uuid(),
    name: z.string(),
  })
  .merge(CreatedUpdated);
export type Sheet = z.infer<typeof Sheet>;

export const CreateSheet = Sheet.omit({ sheetId: true, ...OmitCreatedUpdated });
export type CreateSheet = z.infer<typeof CreateSheet>;

export const UpdateSheet = Sheet.pick({ sheetId: true }).and(
  Sheet.omit(OmitCreatedUpdated).partial()
);
export type UpdateSheet = z.infer<typeof UpdateSheet>;

export const RemoveSheet = Sheet.pick({ sheetId: true });
export type RemoveSheet = z.infer<typeof RemoveSheet>;
