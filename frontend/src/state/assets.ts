import m from "mithril";
import Stream from "mithril/stream";
import * as space from "./space";

type Asset = {
  id: string;
  kind: string;
  filename: string;
};

export const State = () => ({ assets: Stream<Asset[]>([]) });
export type State = ReturnType<typeof State>;

export const Actions = (state: State & space.State) => {
  const updateAssets = () => {
    return m
      .request({
        url: "/assets/",
        params: { space_id: state.space() },
      })
      .then((v) => state.assets(v as Asset[]));
  };

  return { updateAssets };
};

export type Actions = ReturnType<typeof Actions>;
