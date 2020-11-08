import m from "mithril";

const ImageAsset = {
  view({
    attrs: {
      asset: { id, filename },
    },
  }) {
    return [
      m("p", filename),
      m("img", {
        src: `//localhost:8000/assets/${id}`,
      }),
    ];
  },
};

const VideoAsset = {
  view({
    attrs: {
      asset: { id, filename },
    },
  }) {
    return [
      m("p", filename),
      m("video", {
        autoplay: true,
        loop: true,
        src: `//localhost:8000/assets/${id}`,
      }),
    ];
  },
};

const AudioAsset = {
  view({
    attrs: {
      asset: { id, filename },
    },
  }) {
    return [
      m("p", filename),
      m("audio", {
        autoplay: true,
        loop: true,
        src: `//localhost:8000/assets/${id}`,
      }),
    ];
  },
};

const OtherAsset = {
  view({
    attrs: {
      asset: { id, filename },
    },
  }) {
    return m("a", { href: `//localhost:8000/assets/${id}` }, filename);
  },
};

function showAsset(asset_id) {
  return m.request({
    url: "/notify/show-asset",
    method: "POST",
    params: { asset_id },
  });
}

export const Asset = {
  view({ attrs: { asset } }) {
    const { kind, id } = asset;
    const el =
      kind == "image"
        ? ImageAsset
        : kind == "video"
        ? VideoAsset
        : kind == "audio"
        ? AudioAsset
        : OtherAsset;

    return m("li", [
      m(el, { asset }),
      m("button", { onclick: (e) => showAsset(id) }, "SHOW"),
    ]);
  },
};
