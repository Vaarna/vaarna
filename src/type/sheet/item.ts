import z from "zod";

export const ItemBase = z.object({
  sheetId: z.string().uuid(),
  itemId: z.string().uuid(),
  group: z.string(),
  key: z.string(),
  sortKey: z.string(),
  name: z.string(),
  value: z.string(),
  readOnly: z.boolean(),
  onclickEnabled: z.boolean(),
  onclick: z.string(),
});
export type ItemBase = z.infer<typeof ItemBase>;

const type = {
  omni: z.literal("omni"),
  boolean: z.literal("boolean"),
  range: z.literal("range"),
};

export const ItemType = z.union([type.omni, type.boolean, type.range]);
export type ItemType = z.infer<typeof ItemType>;

// --- ITEM OMNI ---

export const ItemOmni = ItemBase.merge(
  z.object({
    type: type.omni,
  })
);

export type ItemOmni = z.infer<typeof ItemOmni>;

// --- ITEM BOOLEAN ---

export const ItemBoolean = ItemBase.merge(
  z.object({
    type: type.boolean,
  })
);

export type ItemBoolean = z.infer<typeof ItemBoolean>;

// --- ITEM RANGE ---

export const ItemRange = ItemBase.merge(
  z.object({
    type: type.range,
    min: z.string().optional(),
    max: z.string().optional(),
  })
);
export type ItemRange = z.infer<typeof ItemRange>;

// --- ITEM ---

export const Item = z.union([ItemOmni, ItemBoolean, ItemRange]);
export type Item = z.infer<typeof Item>;
