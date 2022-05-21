import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  CreateItem,
  Group,
  Item,
  ItemBase,
  ItemRange,
  ItemType,
  Sheet,
  UpdateItem,
} from "type/space";
import { setSpaceId } from "state/slice";
import { RootState } from "state/store";
import { frontend } from "api";
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
  reducers: {
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
export const { setItemParameters, setItemType, setItemMinMax, removeItem, copyItem } =
  items.actions;

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
  (item, thunkApi) => frontend.createItem(item, thunkApi),
  { condition: (_state, { getState }) => !selectCreateItemInProgress(getState()) }
);

export const updateItem = createAsyncThunk<Item, UpdateItem, { state: RootState }>(
  "item/create",
  (item, thunkApi) => frontend.updateItem(item, thunkApi)
);
