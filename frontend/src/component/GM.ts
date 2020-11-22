import m from "mithril";

import * as master from "../state/master";
import AssetList from "./AssetList";
import Table from "./Table";

export default (state: master.State, actions: master.Actions) => {
  return m(".gm", [AssetList(state, actions), Table(state, actions)]);
};
