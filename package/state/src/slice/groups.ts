import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import { frontend } from "@vaarna/api";
import type { CreateGroup, Group, Sheet, UpdateGroup } from "@vaarna/type";

import { setSpaceId } from "../slice";
import type { RootState } from "../store";
import { getSpace } from "./getSpace";

// --- REDUCER ---

export const groupData = createEntityAdapter<Group>({
  selectId: (model) => model.groupId,
  sortComparer: (a, b) => {
    if (a.key === b.key) return a.groupId.localeCompare(b.groupId);
    return a.key.localeCompare(b.key);
  },
});

type GroupsState = {
  createGroupInProgress: boolean;
} & ReturnType<typeof groupData.getInitialState>;

const initialState: GroupsState = groupData.getInitialState({
  createGroupInProgress: false,
});

const groups = createSlice({
  name: "groups",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state) => {
      groupData.removeAll(state);
    });

    b.addCase(getSpace.fulfilled, (state, { payload }) => {
      groupData.upsertMany(state, payload?.groups ?? []);
    });

    b.addCase(createGroup.pending, (state) => {
      state.createGroupInProgress = true;
    });
    b.addCase(createGroup.fulfilled, (state, item) => {
      state.createGroupInProgress = false;
      groupData.addOne(state, item);
    });
    b.addCase(createGroup.rejected, (state) => {
      state.createGroupInProgress = false;
    });
  },
  reducers: {},
});

export default groups.reducer;

// --- SELECT ---

const groupsSelectors = groupData.getSelectors<RootState>((state) => state.groups);

export const selectGroup = groupsSelectors.selectById;
export const selectGroups = groupsSelectors.selectAll;

export const selectGroupsInSheet = (
  state: RootState,
  sheetId: Sheet["sheetId"]
): Group[] => selectGroups(state).filter((group) => group.sheetId === sheetId);

export const selectCreateGroupInProgress = (state: RootState): boolean =>
  state.groups.createGroupInProgress;

// --- ACTION ---

export const createGroup = createAsyncThunk<Group, CreateGroup, { state: RootState }>(
  "group/create",
  frontend.createGroup,
  { condition: (_state, { getState }) => !selectCreateGroupInProgress(getState()) }
);

export const updateGroup = createAsyncThunk<Group, UpdateGroup, { state: RootState }>(
  "group/update",
  frontend.updateGroup
);
