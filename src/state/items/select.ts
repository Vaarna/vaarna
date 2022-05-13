import type { RootState } from "state/store";
import { Group, Item, Sheet } from "type/sheet";
import { itemData } from "./reducer";

const itemsSelectors = itemData.getSelectors<RootState>((state) => state.items);

export const selectItem = itemsSelectors.selectById;
export const selectItems = itemsSelectors.selectAll;

export const selectItemsInSheet = (
  state: RootState,
  sheetId: Sheet["sheetId"]
): Item[] => selectItems(state).filter((group) => group.sheetId === sheetId);

export const selectItemsInGroup = (state: RootState, groupKey: Group["key"]): Item[] =>
  selectItems(state).filter((group) => group.group === groupKey);
