import * as t from "zod";

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

// API

export const GetItemsQuery = t.object({
  spaceId: t.string().uuid(),
  itemId: t.union([
    t.undefined(),
    t.string().uuid(),
    t.array(t.string().uuid()),
  ]),
});
export type GetItemsQuery = t.infer<typeof GetItemsQuery>;

export const RemoveItemQuery = t.object({
  spaceId: t.string().uuid(),
  itemId: t.string().uuid(),
  version: t.string().regex(/^\d+$/),
});
export type RemoveItemQuery = t.infer<typeof RemoveItemQuery>;
