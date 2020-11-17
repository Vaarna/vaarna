import m from "mithril";
import * as master from "./state/master";
import { registerFileUploads, registerNotifier } from "./register";
import { Table, AssetList } from "./component/index";

const state = master.State();
const actions = master.Actions(state);

registerFileUploads(actions);
registerNotifier(actions);
actions.updateAssets();

m.route(document.body, "/", {
  "/": {
    view: () => m("#container", [m(".table", Table(state, actions))]),
  },
  "/gm": {
    view() {
      return m("#container", [
        m(".asset-list", AssetList(state, actions)),
        m(".table", Table(state, actions)),
      ]);
    },
  },
});
