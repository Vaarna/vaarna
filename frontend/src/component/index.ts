import m from "mithril";
import { round } from "../utils";
import * as master from "../state/master";
import { Asset } from "./Asset";

const Table = (state: master.State, _actions: master.Actions) => {
  const table = state.table();
  if (!table) return null;

  return m(".table", Asset({ ...table, autoplay: true }));
};

const Uploads = (state: master.State, _actions: master.Actions) => {
  const uploads = state.uploads();
  if (uploads.length === 0) return null;

  return m(
    "ul",
    uploads.map((v) => {
      const percent = round((v.loaded / v.total) * 100, 2);
      return m("li", `${v.id} ${percent}%`);
    })
  );
};

const Assets = (state: master.State, actions: master.Actions) => {
  const assets = state.assets();
  if (assets.length === 0) return null;

  return m(
    "ul",
    assets.map((v) =>
      m("li", [
        Asset(v),
        m("button", { onclick: () => actions.tableAsset(v.id) }, "SHOW ME"),
      ])
    )
  );
};

export { Table, Uploads, Assets, Asset };
