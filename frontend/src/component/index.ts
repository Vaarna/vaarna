import m from "mithril";
import { round } from "../utils";
import { MasterActions, MasterState } from "../state/master";
import { Asset } from "./Asset";

const Table = (state: MasterState, _actions: MasterActions) => {
  const table = state.table();
  if (!table) return null;

  return m(".table", Asset({ ...table, autoplay: true }));
};

const Uploads = (state: MasterState, _actions: MasterActions) => {
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

const Assets = (state: MasterState, actions: MasterActions) => {
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
