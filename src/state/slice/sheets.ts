import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { frontend } from "api";
import { setSpaceId, selectSpaceId } from "state/slice";
import { RootState } from "state/store";
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

  },
  reducers: {
    setSheetParameters(
      state,
      {
        payload,
      }: PayloadAction<{ sheetId: Sheet["sheetId"] } & Partial<Omit<Sheet, "sheetId">>>
    ) {
      sheetData.updateOne(state, { id: payload.sheetId, changes: payload });
    },
  },
});

export default sheets.reducer;
export const { setSheetParameters } = sheets.actions;

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

    const res = await frontend.createSheet({ spaceId, sheet }, { signal, requestId });
    return res.sheet;
  },
  {
    condition: (_state, { getState }) => !selectSheetCreateInProgress(getState()),
  }
);
