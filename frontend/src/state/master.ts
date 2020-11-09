import { UploadState, UploadActions } from "./upload";
import { TableState, TableActions } from "./table";
import { AssetsActions, AssetsState } from "./assets";

export const MasterState = () => ({
  uploads: UploadState(),
  table: TableState(),
  assets: AssetsState(),
});

export type MasterState = ReturnType<typeof MasterState>;

export const MasterActions = (state: MasterState) => ({
  ...UploadActions(state.uploads),
  ...TableActions(state.table),
  ...AssetsActions(state.assets),
});

export type MasterActions = ReturnType<typeof MasterActions>;
