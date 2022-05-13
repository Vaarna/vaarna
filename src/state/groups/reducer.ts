import {
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Group } from "type/sheet";
import { setSpaceId } from "state/space";

export const groupData = createEntityAdapter<Group>({
  selectId: (model) => model.groupId,
  sortComparer: (a, b) => {
    if (a.key === b.key) return a.groupId.localeCompare(b.groupId);
    return a.key.localeCompare(b.key);
  },
});

type GroupsState = {
  newGroupInProgress: boolean;
} & ReturnType<typeof groupData.getInitialState>;

const initialState: GroupsState = groupData.getInitialState({
  newGroupInProgress: false,
});

const groups = createSlice({
  name: "groups",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      groupData.removeAll(state);
    });
  },
  reducers: {
    newGroup(
      state,
      { payload: { sheetId, key } }: PayloadAction<{ sheetId: string; key: string }>
    ) {
      const groupId = nanoid();
      groupData.addOne(state, { sheetId, groupId, key });
    },

    setGroupParameters(
      state,
      {
        payload,
      }: PayloadAction<
        { groupId: Group["groupId"] } & Partial<Omit<Group, "sheetId" | "groupId">>
      >
    ) {
      groupData.updateOne(state, { id: payload.groupId, changes: payload });
    },
  },
});

export default groups.reducer;
export const { newGroup, setGroupParameters } = groups.actions;
