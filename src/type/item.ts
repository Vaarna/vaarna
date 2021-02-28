import * as t from "zod";

const partialPartial = <
  T extends t.ZodRawShape,
  Mask extends { [k in keyof T]?: true },
  UnknownKeys extends "strip" | "strict" | "passthrough" = "strip",
  Catchall extends t.ZodTypeAny = t.ZodTypeAny
>(
  schema: t.ZodObject<T, UnknownKeys, Catchall>,
  mask: Mask
): t.ZodObject<
  {
    [k in keyof T]: k extends keyof Mask ? ReturnType<T[k]["optional"]> : T[k];
  },
  UnknownKeys,
  Catchall
> => {
  const newShape: any = {};
  for (const key in schema.shape) {
    const fieldSchema = schema.shape[key];
    newShape[key] = mask[key] ? fieldSchema.optional() : fieldSchema;
  }

  return new t.ZodObject({
    ...schema._def,
    shape: () => newShape,
  });
};

export const ItemBase = t.object({
  spaceId: t.string().uuid(),
  itemId: t.string().uuid(),
  created: t.string(),
  updated: t.string(),
  version: t.number().int(),
  path: t.string(),
});
export type ItemBase = t.infer<typeof ItemBase>;

const createOmit: {
  itemId: true;
  created: true;
  updated: true;
  version: true;
} = {
  itemId: true,
  created: true,
  updated: true,
  version: true,
};

const updateOmit: {
  created: true;
  updated: true;
} = {
  created: true,
  updated: true,
};

// NOTE

export const ItemNote = ItemBase.merge(
  t.object({
    type: t.literal("note"),
    public: t.string(),
    private: t.string(),
  })
);
export type ItemNote = t.infer<typeof ItemNote>;

export const ItemNotes = t.array(ItemNote);
export type ItemNotes = t.infer<typeof ItemNotes>;

export const ItemNoteCreate = ItemNote.omit(createOmit);
export type ItemNoteCreate = t.infer<typeof ItemNoteCreate>;

export const ItemNoteUpdate = ItemNote.omit(updateOmit);
export type ItemNoteUpdate = t.infer<typeof ItemNoteUpdate>;

// LINK

export const ItemLink = ItemBase.merge(
  t.object({
    type: t.literal("link"),
    href: t.string().uuid(),
  })
);
export type ItemLink = t.infer<typeof ItemLink>;

export const ItemLinks = t.array(ItemLink);
export type ItemLinks = t.infer<typeof ItemLinks>;

export const ItemLinkCreate = ItemLink.omit(createOmit);
export type ItemLinkCreate = t.infer<typeof ItemLinkCreate>;

export const ItemLinkUpdate = ItemLink.omit(updateOmit);
export type ItemLinkUpdate = t.infer<typeof ItemLinkUpdate>;

// ITEM

export const Item = t.union([ItemNote, ItemLink]);
export type Item = t.infer<typeof Item>;

export const Items = t.array(Item);
export type Items = t.infer<typeof Items>;

export const ItemCreate = t.union([ItemNoteCreate, ItemLinkCreate]);
export type ItemCreate = t.infer<typeof ItemCreate>;

export const ItemUpdate = t.union([ItemNoteUpdate, ItemLinkUpdate]);
export type ItemUpdate = t.infer<typeof ItemUpdate>;
