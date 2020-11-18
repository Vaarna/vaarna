import m from "mithril";

import * as master from "../state/master";
import Asset from "./Asset";

export default (state: master.State, _actions: master.Actions) => {
  const table = state.table();
  if (!table) return m(".table");

  return m(".table", Asset({ ...table, autoplay: true }));
};
