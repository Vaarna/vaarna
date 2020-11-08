import m from "mithril";
import s from "mithril/stream";
import _ from "lodash";
import { Asset } from "./asset";
import { store } from "../state";

export const AssetList = () => {
  return {
    view({ attrs: { notify } }) {
      const { assets } = store.getState();

      return m(
        ".asset-list",
        _.map(assets, (v) =>
          m(".asset-list--item", { key: v.id }, [
            m(Asset, { asset: v }),
            m(
              "button",
              {
                onclick: (e) => {
                  console.log(`display asset ${v.id}`);
                  return notify.showAsset(v.id);
                },
              },
              "SHOW"
            ),
          ])
        )
      );
    },
  };
};
