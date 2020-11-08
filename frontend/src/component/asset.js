import m from "mithril";
import s from "mithril/stream";
import _ from "lodash";
import { store } from "../state";

const ImageAsset = {
  view({
    attrs: {
      asset: { id, filename },
    },
  }) {
    return m("img", {
      src: `/assets/show/${id}`,
      alt: filename,
    });
  },
};

const VideoAsset = {
  view({
    attrs: {
      asset: { id },
    },
  }) {
    return m("video", {
      src: `/assets/show/${id}`,
      controls: true,
    });
  },
};

const AudioAsset = {
  view({
    attrs: {
      asset: { id },
    },
  }) {
    return m("audio", {
      src: `/assets/show/${id}`,
      controls: true,
    });
  },
};

const OtherAsset = {
  view({
    attrs: {
      asset: { id, filename },
    },
  }) {
    return m("a", { href: `/assets/show/${id}` }, filename);
  },
};

export function Asset() {
  return {
    view({ attrs: { asset } }) {
      const { kind } = asset;
      const el =
        kind == "image"
          ? ImageAsset
          : kind == "video"
          ? VideoAsset
          : kind == "audio"
          ? AudioAsset
          : OtherAsset;

      return m(".asset", m(el, { asset: asset }));
    },
  };
}

export const CurrentAsset = {
  view() {
    const asset = store.getState().showAsset;
    if (_.isNil(asset)) return null;
    const { kind } = asset;
    const el =
      kind == "image"
        ? ImageAsset
        : kind == "video"
        ? VideoAsset
        : kind == "audio"
        ? AudioAsset
        : OtherAsset;

    return m(".asset", m(el, { asset: asset }));
  },
};
