import m from "mithril";
import Stream from "mithril/stream";

type Asset = {
  id: string;
  kind: string;
  filename: string;
};

export type State = Stream<Asset[]>;
export const State = () => Stream<Asset[]>([]);

export const Actions = (state: State) => {
  const updateAssets = () => {
    return m
      .request({
        url: "/assets/",
      })
      .then((v) => state(v as Asset[]));
  };

  return { updateAssets };
};

export type Actions = ReturnType<typeof Actions>;
