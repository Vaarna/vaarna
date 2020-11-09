import m from "mithril";
import Stream from "mithril/stream";

type Asset = {
  id: string;
  kind: string;
  filename: string;
};

export type AssetsState = Stream<Asset[]>;
export const AssetsState = () => Stream<Asset[]>([]);

export const AssetsActions = (state: AssetsState) => {
  const updateAssets = () => {
    return m
      .request({
        url: "/assets",
      })
      .then((v) => state(Object.values(v as { [key: string]: Asset })));
  };

  return { updateAssets };
};

export type AssetsActions = ReturnType<typeof AssetsActions>;
