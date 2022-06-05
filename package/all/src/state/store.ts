import { configureStore, Store } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

import groups from "./slice/groups";
import items from "./slice/items";
import sheets from "./slice/sheets";
import space from "./slice/space";

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
