import { z } from "zod";

export const ItemBase = z.object({
  spaceId: z.string().uuid(),
  itemId: z.string().uuid(),
  created: z.string(),
  updated: z.string(),
  version: z.number().int(),
  path: z.string(),
});
export type ItemBase = z.infer<typeof ItemBase>;

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
  z.object({
    type: z.literal("note"),
    public: z.string(),
    private: z.string(),
  })
);
export type ItemNote = z.infer<typeof ItemNote>;

export const ItemNotes = z.array(ItemNote);
export type ItemNotes = z.infer<typeof ItemNotes>;

export const ItemNoteCreate = ItemNote.omit(createOmit);
export type ItemNoteCreate = z.infer<typeof ItemNoteCreate>;

export const ItemNoteUpdate = ItemNote.omit(updateOmit);
export type ItemNoteUpdate = z.infer<typeof ItemNoteUpdate>;

// LINK

export const ItemLink = ItemBase.merge(
  z.object({
    type: z.literal("link"),
    href: z.string().uuid(),
  })
);
export type ItemLink = z.infer<typeof ItemLink>;

export const ItemLinks = z.array(ItemLink);
export type ItemLinks = z.infer<typeof ItemLinks>;

export const ItemLinkCreate = ItemLink.omit(createOmit);
export type ItemLinkCreate = z.infer<typeof ItemLinkCreate>;

export const ItemLinkUpdate = ItemLink.omit(updateOmit);
export type ItemLinkUpdate = z.infer<typeof ItemLinkUpdate>;

// ITEM

export const Item = z.union([ItemNote, ItemLink]);
export type Item = z.infer<typeof Item>;

export const Items = z.array(Item);
export type Items = z.infer<typeof Items>;

export const ItemCreate = z.union([ItemNoteCreate, ItemLinkCreate]);
export type ItemCreate = z.infer<typeof ItemCreate>;

export const ItemUpdate = z.union([ItemNoteUpdate, ItemLinkUpdate]);
export type ItemUpdate = z.infer<typeof ItemUpdate>;

// API

export const GetItemsQuery = z.object({
  spaceId: z.string().uuid(),
  itemId: z.union([
    z.undefined(),
    z.string().uuid(),
    z.array(z.string().uuid()),
  ]),
});
export type GetItemsQuery = z.infer<typeof GetItemsQuery>;

export const RemoveItemQuery = z.object({
  spaceId: z.string().uuid(),
  itemId: z.string().uuid(),
  version: z.string().regex(/^\d+$/),
});
export type RemoveItemQuery = z.infer<typeof RemoveItemQuery>;
