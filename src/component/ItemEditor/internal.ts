export * from "./ItemNote";

import { Item, ItemNote } from "type/item";

export type ItemProps = {
  loading: boolean;
  inflight: boolean;
  dirty: boolean;
  item: Item;
  setItem: (item: Item) => void;
  save: () => void;
};

export type ItemNoteProps = Omit<ItemProps, "item"> & {
  item: ItemNote;
};
