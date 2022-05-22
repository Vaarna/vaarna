import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { frontend } from "api";
import type { RootState } from "state/store";
import { CreateSpace, Space, UpdateSpace } from "type/space";

// --- REDUCER ---

type SpaceState = {
  spaceId: Space["spaceId"] | null;
  createInProgress: boolean;
};

const initialState: SpaceState = { spaceId: null, createInProgress: false };

const spaceId = createSlice({
  name: "space",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state, { payload }) => {
      state.spaceId = payload;
    });

    b.addCase(createSpace.pending, (state) => {
      state.createInProgress = true;
    });
    b.addCase(createSpace.fulfilled, (state) => {
      state.createInProgress = false;
    });
    b.addCase(createSpace.rejected, (state) => {
      state.createInProgress = false;
    });
  },
  reducers: {},
});

export default spaceId.reducer;

// --- SELECT ---

export const selectSpaceId = (state: RootState): string | null => state.space.spaceId;

export const selectSpaceCreateInProgress = (state: RootState): boolean =>
  state.space.createInProgress;

// --- ACTION ---

export const setSpaceId = createAction<SpaceState["spaceId"]>("setSpaceId");

export const createSpace = createAsyncThunk<Space, CreateSpace, { state: RootState }>(
  "space/create",
  frontend.createSpace,
  {
    condition: (_state, { getState }) => !selectSpaceCreateInProgress(getState()),
  }
);

export const updateSpace = createAsyncThunk<Space, UpdateSpace, { state: RootState }>(
  "space/update",
  frontend.updateSpace
);
