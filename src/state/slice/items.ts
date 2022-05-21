import {
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Group, Item, ItemBase, ItemRange, ItemType, Sheet } from "type/space";
import { setSpaceId } from "state/slice";
import { RootState } from "state/store";
import { getCreatedUpdated } from "type/createdUpdated";

// --- REDUCER ---

export const itemData = createEntityAdapter<Item>({
  selectId: (model) => model.itemId,
  sortComparer: (a, b) => {
    if (a.name === b.name) return a.itemId.localeCompare(b.itemId);
    return a.name.localeCompare(b.name);
  },
});

type ItemsState = {
  newItemInProgress: boolean;
} & ReturnType<typeof itemData.getInitialState>;

const initialState: ItemsState = itemData.getInitialState({
  newItemInProgress: false,
});

const items = createSlice({
  name: "items",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      itemData.removeAll(state);
    });
  },
  reducers: {
    newItem(
      state,
      {
        payload: { sheetId, group },
      }: PayloadAction<{ sheetId: string; group?: string }>
    ) {
      const itemId = nanoid();
      itemData.addOne(state, {
        sheetId,
        itemId,
        type: "omni",
        group: group ?? "",
        key: "",
        sortKey: "",
        name: "",
        value: "",
        readOnly: false,
        onclickEnabled: false,
        onclick: "",
        ...getCreatedUpdated(),
      });
    },

    setItemParameters(
      state,
      {
        payload,
      }: PayloadAction<
        { itemId: Item["itemId"] } & Partial<Omit<ItemBase, "sheetId" | "itemId">>
      >
    ) {
      itemData.updateOne(state, { id: payload.itemId, changes: payload });
    },

    setItemType(
      state,
      {
        payload: { itemId, type },
      }: PayloadAction<{ itemId: Item["itemId"]; type: ItemType }>
    ) {
      itemData.updateOne(state, { id: itemId, changes: { type } });
    },

    setItemMinMax(
      state,
      {
        payload: { itemId, min, max },
      }: PayloadAction<{
        itemId: Item["itemId"];
        min?: ItemRange["min"];
        max?: ItemRange["max"];
      }>
    ) {
      const changes: { min?: ItemRange["min"]; max?: ItemRange["max"] } = {};

      if (min !== undefined) changes.min = min;
      if (max !== undefined) changes.max = max;

      // TODO: check item.type before changing anything
      const item = state.entities[itemId];
      if (item === undefined) return;
      if (item.type !== "range")
        return console.error("tried to set min/max of non-range item");

      itemData.updateOne(state, { id: itemId, changes });
    },

    removeItem(state, action: PayloadAction<Item["itemId"]>) {
      itemData.removeOne(state, action.payload);
    },

    copyItem(state, action: PayloadAction<Item["itemId"]>) {
      const item = state.entities[action.payload];
      if (item === undefined) return;

      const itemId = nanoid();
      itemData.addOne(state, { ...item, itemId });
    },
  },
});

export default items.reducer;
export const {
  newItem,
  setItemParameters,
  setItemType,
  setItemMinMax,
  removeItem,
  copyItem,
} = items.actions;

// --- SELECT ---

const itemsSelectors = itemData.getSelectors<RootState>((state) => state.items);

export const selectItem = itemsSelectors.selectById;
export const selectItems = itemsSelectors.selectAll;

export const selectItemsInSheet = (
  state: RootState,
  sheetId: Sheet["sheetId"]
): Item[] => selectItems(state).filter((group) => group.sheetId === sheetId);

export const selectItemsInGroup = (state: RootState, groupKey: Group["key"]): Item[] =>
  selectItems(state).filter((group) => group.group === groupKey);
