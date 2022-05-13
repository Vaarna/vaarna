import { configureStore, Store } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

import space from "reducer/space";
import sheets from "reducer/sheets";
import groups from "reducer/groups";
import items from "reducer/items";

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

export const wrapper = createWrapper<Store<RootState>>(() => store, {
  debug: process.env.NODE_ENV === "development",
});
