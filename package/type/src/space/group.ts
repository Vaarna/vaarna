import { z } from "zod";

import { CreatedUpdated, OmitCreatedUpdated } from "../createdUpdated";
import { Sheet } from "./sheet";
import { Space } from "./space";

const display = {
  rows: z.literal("rows"),
  columns: z.literal("columns"),
};

export const GroupDisplay = z.union([display.rows, display.columns]);
export type GroupDisplay = z.infer<typeof GroupDisplay>;

const sortBy = {
  sortKey: z.literal("sortKey"),
  key: z.literal("key"),
  name: z.literal("name"),
  valueEvaluated: z.literal("valueEvaluated"),
};

export const GroupSortBy = z.union([
  sortBy.sortKey,
  sortBy.key,
  sortBy.name,
  sortBy.valueEvaluated,
]);
export type GroupSortBy = z.infer<typeof GroupSortBy>;

const sortOrder = {
  asc: z.literal("asc"),
  desc: z.literal("desc"),
};

export const GroupSortOrder = z.union([sortOrder.asc, sortOrder.desc]);
export type GroupSortOrder = z.infer<typeof GroupSortOrder>;

export const Group = z
  .object({
    spaceId: Space.shape.spaceId,
    sheetId: Sheet.shape.sheetId,
    groupId: z.union([z.literal(""), z.string().uuid()]),
    key: z.string(),
  })
  .merge(
    z
      .object({
        name: z.string(),
        sortKey: z.string(),
        display: GroupDisplay,
        sortBy: z.array(GroupSortBy),
        sortOrder: GroupSortOrder,
      })
      .partial()
  )
  .merge(CreatedUpdated);
export type Group = z.infer<typeof Group>;

export const CreateGroup = Group.omit({ groupId: true, ...OmitCreatedUpdated });
export type CreateGroup = z.infer<typeof CreateGroup>;

export const UpdateGroup = Group.pick({ spaceId: true, groupId: true }).and(
  Group.omit({ sheetId: true, ...OmitCreatedUpdated }).partial()
);
export type UpdateGroup = z.infer<typeof UpdateGroup>;

export const RemoveGroup = Group.pick({ groupId: true });
export type RemoveGroup = z.infer<typeof RemoveGroup>;
