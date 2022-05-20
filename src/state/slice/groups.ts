import {
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { CreateGroup, Group, Sheet } from "type/space";
import { setSpaceId } from "state/slice";
import type { RootState } from "state/store";

// --- REDUCER ---

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
    newGroup(state, { payload }: PayloadAction<CreateGroup>) {
      const groupId = nanoid();
      groupData.addOne(state, { ...payload, groupId });
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

// --- SELECT ---

const groupsSelectors = groupData.getSelectors<RootState>((state) => state.groups);

export const selectGroup = groupsSelectors.selectById;
export const selectGroups = groupsSelectors.selectAll;

export const selectGroupsInSheet = (
  state: RootState,
  sheetId: Sheet["sheetId"]
): Group[] => selectGroups(state).filter((group) => group.sheetId === sheetId);
