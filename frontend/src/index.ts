import m from "mithril";

import GM from "./component/GM";
import Player from "./component/Player";
import Spaces from "./component/Spaces";
import { registerFileUploads, registerNotifier } from "./register";
import * as master from "./state/master";

const state = master.State();
const actions = master.Actions(state);

registerFileUploads(actions);
registerNotifier(actions);
actions.updateAssets();

m.route(document.body, "/spaces", {
  "/spaces": {
    view: () => Spaces(state, actions),
  },
  "/player": {
    view: () => Player(state, actions),
  },
  "/gm": {
    view: () => GM(state, actions),
  },
});
