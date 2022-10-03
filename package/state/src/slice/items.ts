import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import { frontend } from "@vaarna/api";
import { CreateItem, Group, Item, Sheet, UpdateItem } from "@vaarna/type";

import { setSpaceId } from "../slice";
import { RootState } from "../store";
import { getSpace } from "./getSpace";

// --- REDUCER ---

export const itemData = createEntityAdapter<Item>({
  selectId: (model) => model.itemId,
  sortComparer: (a, b) => {
    if (a.name === b.name) return a.itemId.localeCompare(b.itemId);
    return a.name.localeCompare(b.name);
  },
});

type ItemsState = {
  createItemInProgress: boolean;
} & ReturnType<typeof itemData.getInitialState>;

const initialState: ItemsState = itemData.getInitialState({
  createItemInProgress: false,
});

const items = createSlice({
  name: "items",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      itemData.removeAll(state);
    });

    b.addCase(getSpace.fulfilled, (state, { payload }) => {
      itemData.upsertMany(state, payload?.items ?? []);
    });

    b.addCase(createItem.pending, (state) => {
      state.createItemInProgress = true;
    });
    b.addCase(createItem.fulfilled, (state, item) => {
      state.createItemInProgress = false;
      itemData.addOne(state, item);
    });
    b.addCase(createItem.rejected, (state) => {
      state.createItemInProgress = false;
    });
  },
  reducers: {},
});

export default items.reducer;

// --- SELECT ---

const itemsSelectors = itemData.getSelectors<RootState>((state) => state.items);

export const selectItem = itemsSelectors.selectById;
export const selectItems = itemsSelectors.selectAll;

export const selectItemsInSheet = (
  state: RootState,
  sheetId: Sheet["sheetId"]
): Item[] => selectItems(state).filter((item) => item.sheetId === sheetId);

export const selectItemsInGroup = (state: RootState, groupKey: Group["key"]): Item[] =>
  selectItems(state).filter((item) => item.group === groupKey);

export const selectCreateItemInProgress = (state: RootState): boolean =>
  state.items.createItemInProgress;

// --- ACTION ---

export const createItem = createAsyncThunk<Item, CreateItem, { state: RootState }>(
  "item/create",
  frontend.createItem,
  { condition: (_state, { getState }) => !selectCreateItemInProgress(getState()) }
);

export const updateItem = createAsyncThunk<Item, UpdateItem, { state: RootState }>(
  "item/update",
  frontend.updateItem
);
