import m from "mithril";
import { MasterState, MasterActions } from "./state/master";
import { registerFileUploads, registerNotifier } from "./register";
import { Table, Assets, Uploads } from "./component/index";

const state = MasterState();
const actions = MasterActions(state);

registerFileUploads(actions);
registerNotifier(actions);
actions.updateAssets();

m.route(document.body, "/", {
  "/": {
    view: () => [Table(state, actions)],
  },
  "/gm": {
    view() {
      return [
        Table(state, actions),
        Assets(state, actions),
        Uploads(state, actions),
      ];
    },
  },
});
