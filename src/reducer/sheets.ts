import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { Sheet } from "type/sheet";
import { setSpaceId } from "./space";

type SheetsState = Record<string, Sheet>;

const initialSheets: SheetsState = {};

const sheets = createSlice({
  name: "sheets",
  initialState: initialSheets,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      for (const key of Object.keys(state)) delete state[key];
    });
  },
  reducers: {
    newSheet(state) {
      const sheetId = nanoid();
      state[sheetId] = { sheetId, name: "" };
    },

    setSheetParameters(
      state,
      {
        payload,
      }: PayloadAction<{ sheetId: Sheet["sheetId"] } & Partial<Omit<Sheet, "sheetId">>>
    ) {
      const sheet = state[payload.sheetId];
      state[payload.sheetId] = { ...sheet, ...payload };
    },
  },
});

export default sheets.reducer;
export const { newSheet, setSheetParameters } = sheets.actions;
