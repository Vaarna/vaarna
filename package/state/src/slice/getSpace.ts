import { createAsyncThunk } from "@reduxjs/toolkit";

import { frontend } from "@vaarna/api";
import { Group, Item, Sheet, Space } from "@vaarna/type";

import { RootState } from "../store";

type Output = {
  space: Space;
  sheets: Sheet[];
  groups: Group[];
  items: Item[];
};

export const getSpace = createAsyncThunk<
  Output | undefined,
  Space["spaceId"],
  { state: RootState }
>("space/get", async (spaceId, thunkApi) => {
  return frontend.getSpace(spaceId, thunkApi);
});
