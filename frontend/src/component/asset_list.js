import m from "mithril";
import s from "mithril/stream";
import _ from "lodash";
import { Asset } from "./asset";

export const AssetList = ({ attrs: { uploadsState } }) => {
  let assets = s({});

  const update = () => {
    console.log("update assets");
    return m
      .request({
        url: "//localhost:8000/assets/",
      })
      .then(assets);
  };

  uploadsState.uploadComplete.map(update);

  return {
    oninit: update,
    view() {
      return m(
        "ul",
        _.map(assets(), (v) => m(Asset, { key: v.id, ...v }))
      );
    },
  };
};
