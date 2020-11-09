import m from "mithril";
import * as master from "./state/master";
import { registerFileUploads, registerNotifier } from "./register";
import { Table, Assets, Uploads } from "./component/index";

const state = master.State();
const actions = master.Actions(state);

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
