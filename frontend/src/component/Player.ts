import m from "mithril";

import * as master from "../state/master";
import Table from "./Table";

export default (state: master.State, actions: master.Actions) =>
  m(".player", Table(state, actions));
