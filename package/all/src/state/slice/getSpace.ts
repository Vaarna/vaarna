import { createAsyncThunk } from "@reduxjs/toolkit";
import { frontend } from "../../api";
import { RootState } from "../../state/store";
import { Group, Item, Sheet, Space } from "@gm-screen/type";

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
