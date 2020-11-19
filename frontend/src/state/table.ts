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
        url: "/assets/:asset_id/",
        params: { space_id: state.space(), asset_id },
      })
      .then((v) => state.table(v as Table));
  };

  const tableAsset = (space_id: string, asset_id: string) => {
    return m.request({
      url: "/notify/show-asset/",
      method: "POST",
      params: { space_id, asset_id },
    });
  };

  return { showAsset, tableAsset };
};

export type Actions = ReturnType<typeof Actions>;
