import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSheet } from "api";
import type { RootState } from "state/store";
import { CreateSheet, Sheet } from "type/sheet";
import { selectSpaceId } from "state/space";

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
