import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { createSheet } from "api";
import type { RootState } from "store";
import { CreateSheet, Sheet } from "type/sheet";
import { setSpaceId, selectSpaceId } from "./space";

export const newSheet = createAsyncThunk<Sheet, CreateSheet, { state: RootState }>(
  "sheet/new",
  async (sheet, { getState, signal, requestId }) => {
    const spaceId = selectSpaceId(getState());
    if (spaceId === null) throw new Error("spaceId is not set");
    return createSheet({ spaceId, sheet }, { signal, requestId });
  },
  {
    condition: (_state, { getState }) => !getState().sheets.newSheetInProgress,
  }
);

export const sheetData = createEntityAdapter<Sheet>({
  selectId: (model) => model.sheetId,
  sortComparer: (a, b) => {
    if (a.name === b.name) return a.sheetId.localeCompare(b.sheetId);
    return a.name.localeCompare(b.name);
  },
});

type SheetsState = {
  newSheetInProgress: boolean;
  data: EntityState<Sheet>;
};

const initialSheets: SheetsState = {
  newSheetInProgress: false,
  data: sheetData.getInitialState(),
};

const sheets = createSlice({
  name: "sheets",
  initialState: initialSheets,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      sheetData.removeAll(state.data);
    });

    b.addCase(newSheet.pending, (state) => {
      state.newSheetInProgress = true;
    });
    b.addCase(newSheet.fulfilled, (state, { payload }) => {
      state.newSheetInProgress = false;
      sheetData.addOne(state.data, payload);
    });
    b.addCase(newSheet.rejected, (state) => {
      state.newSheetInProgress = false;
    });
  },
  reducers: {
    setSheetParameters(
      state,
      {
        payload,
      }: PayloadAction<{ sheetId: Sheet["sheetId"] } & Partial<Omit<Sheet, "sheetId">>>
    ) {
      sheetData.updateOne(state.data, { id: payload.sheetId, changes: payload });
    },
  },
});

export default sheets.reducer;
export const { setSheetParameters } = sheets.actions;

const sheetsSelectors = sheetData.getSelectors<RootState>((state) => state.sheets.data);
export const selectSheet = sheetsSelectors.selectById;
export const selectSheets = sheetsSelectors.selectAll;
