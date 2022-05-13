import { createAction, createSlice } from "@reduxjs/toolkit";

const setSpaceId = createAction<SpaceState["spaceId"]>("setSpaceId");

type SpaceState = {
  spaceId: string | null;
};

const initialState: SpaceState = { spaceId: null };

const spaceId = createSlice({
  name: "groups",
  initialState,
  extraReducers: (b) => {
    b.addCase(setSpaceId, (state, { payload }) => {
      state.spaceId = payload;
    });
  },
  reducers: {},
});

export default spaceId.reducer;
export { setSpaceId };
