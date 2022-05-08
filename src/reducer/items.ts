import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { Item, ItemBase, ItemRange, ItemType } from "type/sheet";
import { setSpaceId } from "./space";

type ItemsState = Record<string, Item>;

const initialState: ItemsState = {};

const items = createSlice({
  name: "items",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      for (const key of Object.keys(state)) delete state[key];
    });
  },
  reducers: {
    newItem(state, { payload: { sheetId } }: PayloadAction<{ sheetId: string }>) {
      const itemId = nanoid();
      state[itemId] = {
        sheetId,
        itemId,
        type: "omni",
        group: "",
        key: "",
        sortKey: "",
        name: "",
        value: "",
        readOnly: false,
        onclickEnabled: false,
        onclick: "",
      };
    },

    setItemParameters(
      state,
      {
        payload,
      }: PayloadAction<
        { itemId: Item["itemId"] } & Partial<Omit<ItemBase, "sheetId" | "itemId">>
      >
    ) {
      const item = state[payload.itemId];
      state[payload.itemId] = { ...item, ...payload };
    },

    setItemType(
      state,
      {
        payload: { itemId, type },
      }: PayloadAction<{ itemId: Item["itemId"]; type: ItemType }>
    ) {
      state[itemId].type = type;
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
      const item = state[itemId];
      if (item.type !== "range")
        return console.error("tried to set min/max of non-range item");

      if (min !== undefined) item.min = min;
      if (max !== undefined) item.max = max;
    },

    removeItem(state, action: PayloadAction<Item["itemId"]>) {
      delete state[action.payload];
    },

    copyItem(state, action: PayloadAction<Item["itemId"]>) {
      const item = state[action.payload];
      const itemId = nanoid();
      state[itemId] = { ...item, itemId };
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
