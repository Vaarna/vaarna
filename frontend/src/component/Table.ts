import { Asset } from "./Asset";
import * as master from "../state/master";

export const Table = (state: master.State, _actions: master.Actions) => {
  const table = state.table();
  if (!table) return null;

  return Asset({ ...table, autoplay: true });
};
