import { configureStore, Store } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

import space from "./slice/space";
import sheets from "./slice/sheets";
import groups from "./slice/groups";
import items from "./slice/items";

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
