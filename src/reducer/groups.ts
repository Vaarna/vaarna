import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { Group } from "type/sheet";
import { setSpaceId } from "./space";

type GroupsState = Record<string, Group>;

const initialState: GroupsState = {};

const groups = createSlice({
  name: "groups",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      for (const key of Object.keys(state)) delete state[key];
    });
  },
  reducers: {
    newGroup(
      state,
      { payload: { sheetId, key } }: PayloadAction<{ sheetId: string; key: string }>
    ) {
      const groupId = nanoid();
      state[groupId] = { sheetId, groupId, key };
    },

    setGroupParameters(
      state,
      {
        payload,
      }: PayloadAction<
        { groupId: Group["groupId"] } & Partial<Omit<Group, "sheetId" | "groupId">>
      >
    ) {
      const group = state[payload.groupId];
      state[payload.groupId] = { ...group, ...payload };
    },
  },
});

export default groups.reducer;
export const { newGroup, setGroupParameters } = groups.actions;
