import m from "mithril";

import * as master from "../state/master";
import { round } from "../utils";
import Asset from "./Asset";

export default (state: master.State, actions: master.Actions) => {
  const uploads = state.uploads();
  const assets = state.assets();
  const items = [...uploads, ...assets];

  return m(
    ".asset-list",
    items.map((v) =>
      "kind" in v
        ? [
            Asset(v),
            m("button", { onclick: () => actions.tableAsset(v.id) }, "SHOW ME"),
          ]
        : `${v.id} ${round((v.loaded / v.total) * 100, 2)}%`
    )
  );
};
