import m from "mithril";

const ImageAsset = {
  view({ attrs: { id, filename } }) {
    return [
      m("p", filename),
      m("img", {
        src: `//localhost:8000/assets/${id}`,
      }),
    ];
  },
};

const VideoAsset = {
  view({ attrs: { id, filename } }) {
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
  view({ attrs: { id, filename } }) {
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
  view({ attrs: { id, filename } }) {
    return m("a", { href: `//localhost:8000/assets/${id}` }, filename);
  },
};

export const Asset = {
  view({ attrs }) {
    const { kind, id } = attrs;
    const el =
      kind == "image"
        ? ImageAsset
        : kind == "video"
        ? VideoAsset
        : kind == "audio"
        ? AudioAsset
        : OtherAsset;

    return m("li", { key: id }, m(el, attrs));
  },
};
