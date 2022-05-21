import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { frontend } from "api";
import { setSpaceId, selectSpaceId } from "state/slice";
import { RootState } from "state/store";
import { CreateSheet, Sheet, UpdateSheet } from "type/space";
import { getSpace } from "./getSpace";

// --- REDUCER ---

export const sheetData = createEntityAdapter<Sheet>({
  selectId: (model) => model.sheetId,
  sortComparer: (a, b) => {
    if (a.name === b.name) return a.sheetId.localeCompare(b.sheetId);
    return a.name.localeCompare(b.name);
  },
});

type SheetsState = {
  createInProgress: boolean;
} & ReturnType<typeof sheetData.getInitialState>;

const initialState: SheetsState = sheetData.getInitialState({
  createInProgress: false,
});

const sheets = createSlice({
  name: "sheets",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      sheetData.removeAll(state);
    });

    b.addCase(createSheet.pending, (state) => {
      state.createInProgress = true;
    });
    b.addCase(createSheet.fulfilled, (state, { payload }) => {
      state.createInProgress = false;
      sheetData.addOne(state, payload);
    });
    b.addCase(createSheet.rejected, (state) => {
      state.createInProgress = false;
    });

    b.addCase(getSpace.fulfilled, (state, action) => {
      sheetData.upsertMany(state, action.payload?.sheets ?? []);
    });

    b.addCase(updateSheet.fulfilled, (state, { payload }) => {
      sheetData.updateOne(state, { id: payload.sheetId, changes: payload });
    });
  },
  reducers: {},
});

export default sheets.reducer;

// --- SELECT ---

const sheetsSelectors = sheetData.getSelectors<RootState>((state) => state.sheets);

export const selectSheet = sheetsSelectors.selectById;
export const selectSheets = sheetsSelectors.selectAll;

export const selectSheetCreateInProgress = (state: RootState): boolean =>
  state.sheets.createInProgress;

// --- ACTION ---

export const createSheet = createAsyncThunk<Sheet, CreateSheet, { state: RootState }>(
  "sheet/create",
  async (sheet, { getState, signal, requestId }) => {
    const spaceId = selectSpaceId(getState());
    if (spaceId === null) throw new Error("spaceId is not set");

    return frontend.createSheet(sheet, { signal, requestId });
  },
  {
    condition: (_state, { getState }) => !selectSheetCreateInProgress(getState()),
  }
);

export const updateSheet = createAsyncThunk<Sheet, UpdateSheet, { state: RootState }>(
  "sheet/update",
  async (sheet, { getState, signal, requestId }) => {
    const spaceId = selectSpaceId(getState());
    if (spaceId === null) throw new Error("spaceId is not set");

    const res = await frontend.updateSheet(sheet, { signal, requestId });
    return res;
  }
);
