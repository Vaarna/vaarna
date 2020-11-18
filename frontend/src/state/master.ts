import * as assets from "./assets";
import * as table from "./table";
import * as upload from "./upload";

export const State = () => ({
  uploads: upload.State(),
  table: table.State(),
  assets: assets.State(),
});

export type State = ReturnType<typeof State>;

export const Actions = (state: State) => ({
  ...upload.Actions(state.uploads),
  ...table.Actions(state.table),
  ...assets.Actions(state.assets),
});

export type Actions = ReturnType<typeof Actions>;
