import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectSpaceId } from "select";
import { RootState } from "store";
import { Group, Item, Sheet } from "type/sheet";

export const fetchSpace = createAsyncThunk<
  (Sheet | Item | Group)[],
  never,
  {
    state: RootState;
  }
>("fetchSpace", async (_: never, thunkAPI) => {
  // const { spaceId } = selectSpaceId(thunkAPI.getState());
  return [];
});
