import m from "mithril";

import * as master from "../state/master";

export default (_state: master.State, _actions: master.Actions) =>
  m(
    ".spaces",
    m(
      ".workspace-list",
      ["this", "that", "other"].map((v) =>
        m(".login-item", [
          m("p", v),
          m("button", "join as player"),
          m("button", "join as gm"),
        ])
      )
    )
  );
