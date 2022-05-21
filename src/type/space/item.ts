import z from "zod";
import { CreatedUpdated, OmitCreatedUpdated } from "../createdUpdated";
import { Sheet } from "./sheet";
import { Space } from "./space";

export const ItemBase = z
  .object({
    spaceId: Space.shape.spaceId,
    sheetId: Sheet.shape.sheetId,
    itemId: z.string().uuid(),
    group: z.string(),
    key: z.string(),
    sortKey: z.string(),
    name: z.string(),
    value: z.string(),
    readOnly: z.boolean(),
    onclickEnabled: z.boolean(),
    onclick: z.string(),
  })
  .merge(CreatedUpdated);
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

export const CreateItemOmni = ItemOmni.omit({ itemId: true, ...OmitCreatedUpdated });
export type CreateItemOmni = z.infer<typeof CreateItemOmni>;

export const UpdateItemOmni = ItemOmni.pick({ itemId: true }).and(
  ItemOmni.omit({
    sheetId: true,
    ...OmitCreatedUpdated,
  }).partial()
);
export type UpdateItemOmni = z.infer<typeof UpdateItemOmni>;

// --- ITEM BOOLEAN ---

export const ItemBoolean = ItemBase.merge(
  z.object({
    type: type.boolean,
  })
);

export type ItemBoolean = z.infer<typeof ItemBoolean>;

export const CreateItemBoolean = ItemBoolean.omit({
  itemId: true,
  ...OmitCreatedUpdated,
});
export type CreateItemBoolean = z.infer<typeof CreateItemBoolean>;

export const UpdateItemBoolean = ItemBoolean.pick({ itemId: true }).and(
  ItemBoolean.omit({
    sheetId: true,
    ...OmitCreatedUpdated,
  }).partial()
);
export type UpdateItemBoolean = z.infer<typeof UpdateItemBoolean>;

// --- ITEM RANGE ---

export const ItemRange = ItemBase.merge(
  z.object({
    type: type.range,
    min: z.string().optional(),
    max: z.string().optional(),
  })
);
export type ItemRange = z.infer<typeof ItemRange>;

export const CreateItemRange = ItemRange.omit({ itemId: true, ...OmitCreatedUpdated });
export type CreateItemRange = z.infer<typeof CreateItemRange>;

export const UpdateItemRange = ItemRange.pick({ itemId: true }).and(
  ItemRange.omit({ sheetId: true, ...OmitCreatedUpdated }).partial()
);
export type UpdateItemRange = z.infer<typeof UpdateItemRange>;

// --- ITEM ---

export const Item = z.union([ItemOmni, ItemBoolean, ItemRange]);
export type Item = z.infer<typeof Item>;

export const CreateItem = z.union([CreateItemOmni, CreateItemBoolean, CreateItemRange]);
export type CreateItem = z.infer<typeof CreateItem>;

export const UpdateItem = z.union([UpdateItemOmni, UpdateItemBoolean, UpdateItemRange]);
export type UpdateItem = z.infer<typeof UpdateItem>;
