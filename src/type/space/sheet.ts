import z from "zod";

export const Sheet = z.object({
  sheetId: z.string().uuid(),
  name: z.string(),
});
export type Sheet = z.infer<typeof Sheet>;

export const CreateSheet = Sheet.omit({ sheetId: true });
export type CreateSheet = z.infer<typeof CreateSheet>;

export const UpdateSheet = Sheet.pick({ sheetId: true }).and(Sheet.partial());
export type UpdateSheet = z.infer<typeof UpdateSheet>;

export const RemoveSheet = Sheet.pick({ sheetId: true });
export type RemoveSheet = z.infer<typeof RemoveSheet>;
