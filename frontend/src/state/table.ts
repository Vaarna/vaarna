import m from "mithril";
import Stream from "mithril/stream";

type Table = {
  id: string;
  kind: string;
  filename: string;
};

export type State = Stream<Table | undefined>;
export const State = () => Stream<Table | undefined>();

export const Actions = (state: State) => {
  const showAsset = (asset_id: string) => {
    return m
      .request({
        url: "/assets/:id",
        params: { id: asset_id },
      })
      .then((v) => state(v as Table));
  };

  const tableAsset = (asset_id: string) => {
    return m.request({
      url: "/notify/show-asset",
      method: "POST",
      params: { asset_id },
    });
  };

  return { showAsset, tableAsset };
};

export type Actions = ReturnType<typeof Actions>;
