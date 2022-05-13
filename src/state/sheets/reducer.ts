import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setSpaceId } from "state/space";
import { Sheet } from "type/sheet";
import { newSheet } from "./action";

export const sheetData = createEntityAdapter<Sheet>({
  selectId: (model) => model.sheetId,
  sortComparer: (a, b) => {
    if (a.name === b.name) return a.sheetId.localeCompare(b.sheetId);
    return a.name.localeCompare(b.name);
  },
});

type SheetsState = {
  newSheetInProgress: boolean;
} & ReturnType<typeof sheetData.getInitialState>;

const initialState: SheetsState = sheetData.getInitialState({
  newSheetInProgress: false,
});

const sheets = createSlice({
  name: "sheets",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      sheetData.removeAll(state);
    });

    b.addCase(newSheet.pending, (state) => {
      state.newSheetInProgress = true;
    });
    b.addCase(newSheet.fulfilled, (state, { payload }) => {
      state.newSheetInProgress = false;
      sheetData.addOne(state, payload);
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
      sheetData.updateOne(state, { id: payload.sheetId, changes: payload });
    },
  },
});

export default sheets.reducer;
export const { setSheetParameters } = sheets.actions;
