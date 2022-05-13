import { configureStore, Store } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

import space from "./space/reducer";
import sheets from "./sheets/reducer";
import groups from "./groups/reducer";
import items from "./items/reducer";

export const store = configureStore({
  devTools: process.env.NODE_ENV === "development",
  reducer: {
    space,
    sheets,
    groups,
    items,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const wrapper = createWrapper<Store<RootState>>(() => store);
