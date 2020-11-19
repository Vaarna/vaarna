import m from "mithril";

import * as master from "../state/master";

export default (state: master.State, _actions: master.Actions) =>
  m(
    ".spaces",
    m(".space", [
      m("input", {
        value: state.space(),
        oninput: (e: InputEvent) =>
          state.space((e.target as HTMLInputElement).value),
      }),
      m(
        "button",
        {
          onclick: () => m.route.set("/player"),
        },
        "join as player"
      ),
      m(
        "button",
        {
          onclick: () => m.route.set("/gm"),
        },
        "join as gm"
      ),
    ])
  );
