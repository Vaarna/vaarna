import { z } from "zod";
import { CreateGroup } from "./group";
import { CreateSheet } from "./sheet";
import { CreateSpace } from "./space";

export * from "./space";
export * from "./sheet";
export * from "./group";
export * from "./item";

export const CreateSpaceContent = z
  .object({
    space: CreateSpace,
    sheets: z.array(CreateSheet),
    groups: z.array(CreateGroup),
    // items: z.array(CreateItem)
  })
  .partial();
