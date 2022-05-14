import { z } from "zod";
import { Group, Item, Sheet, Space } from "./space";

export const FetchSpace = z.object({
  space: Space,
  sheet: z.array(Sheet),
  group: z.array(Group),
  item: z.array(Item),
});
export type FetchSpace = z.infer<typeof FetchSpace>;
