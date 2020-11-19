import * as assets from "./assets";
import * as space from "./space";
import * as table from "./table";
import * as upload from "./upload";

export const State = () => ({
  ...assets.State(),
  ...space.State(),
  ...table.State(),
  ...upload.State(),
});

export type State = ReturnType<typeof State>;

export const Actions = (state: State) => ({
  ...assets.Actions(state),
  ...space.Actions(state),
  ...table.Actions(state),
  ...upload.Actions(state),
});

export type Actions = ReturnType<typeof Actions>;
