import m from "mithril";

import GM from "./component/GM";
import Player from "./component/Player";
import Spaces from "./component/Spaces";
import { registerFileUploads, registerNotifier } from "./register";
import * as master from "./state/master";

const state = master.State();
const actions = master.Actions(state);

function PlayerRoute(state: master.State, actions: master.Actions) {
  let unregisterNotifier: () => void | undefined;

  return {
    oncreate() {
      console.log("oncreate", state.space(), unregisterNotifier);
      unregisterNotifier = registerNotifier(state, actions);
    },

    view() {
      if (state.space() === "") m.route.set("/spaces");
      return Player(state, actions);
    },

    onremove() {
      if (unregisterNotifier) unregisterNotifier();
    },
  };
}

function GMRoute(state: master.State, actions: master.Actions) {
  let unregisterNotifier: () => void | undefined;
  let unregisterFileUploads: () => void | undefined;

  return {
    oncreate() {
      unregisterNotifier = registerNotifier(state, actions);
      unregisterFileUploads = registerFileUploads(actions);
      actions.updateAssets();
    },

    view() {
      if (state.space() === "") m.route.set("/spaces");
      return GM(state, actions);
    },

    onremove() {
      if (unregisterNotifier) unregisterNotifier();
      if (unregisterFileUploads) unregisterFileUploads();
    },
  };
}

m.route(document.body, "/spaces", {
  "/spaces": {
    view: () => Spaces(state, actions),
  },
  "/player": PlayerRoute(state, actions),
  "/gm": GMRoute(state, actions),
});
