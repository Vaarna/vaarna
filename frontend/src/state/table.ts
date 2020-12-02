import m from "mithril";
import Stream from "mithril/stream";
import * as space from "./space";

type Table = {
  id: string;
  kind: string;
  filename: string;
};

export const State = () => ({ table: Stream<Table | undefined>() });
export type State = ReturnType<typeof State>;

export const Actions = (state: State & space.State) => {
  const showAsset = (asset_id: string) => {
    return m
      .request({
        url: "/assets/",
        params: { space_id: state.space(), asset_id },
      })
      .then((v) => state.table(v as Table));
  };

  const showCurrentAsset = (space_id: string) => {
    return m
      .request({
        url: "/table/",
        params: { space_id },
      })
      .then((v) => showAsset((v as { table: string }).table));
  };

  const tableAsset = (space_id: string, asset_id: string) => {
    return m.request({
      url: "/table/",
      method: "POST",
      params: { space_id, asset_id },
    });
  };

  return { showCurrentAsset, showAsset, tableAsset };
};

export type Actions = ReturnType<typeof Actions>;
