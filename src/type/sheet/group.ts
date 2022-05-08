import z from "zod";

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
    name: z.string(),
    sortKey: z.string(),
    display: GroupDisplay,
    sortBy: z.array(GroupSortBy),
    sortOrder: GroupSortOrder,
  })
  .partial()
  .merge(
    z.object({
      groupId: z.union([z.literal(""), z.string().uuid()]),
      sheetId: z.string().uuid(),
      key: z.string(),
    })
  );

export type Group = z.infer<typeof Group>;
