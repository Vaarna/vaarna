import z from "zod";

export const Sheet = z.object({
  sheetId: z.string().uuid(),
  name: z.string(),
});
export type Sheet = z.infer<typeof Sheet>;
