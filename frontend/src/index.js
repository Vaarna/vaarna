import m from "mithril";
import s from "mithril/stream";
import _, { method } from "lodash";
import { uploadAssets, uploads, Uploads } from "./uploader";

window.addEventListener("paste", (event) => {
  uploadAssets(
    _.chain(event.clipboardData.items)
      .map((item) => item.getAsFile())
      .filter((item) => item !== null)
      .value()
  );
});

const prevent = (event) => {
  event.preventDefault();
};

document.body.addEventListener("dragenter", prevent);
document.body.addEventListener("dragover", prevent);

document.body.addEventListener("drop", (event) => {
  event.preventDefault();

  uploadAssets(
    _.chain(event.dataTransfer.items)
      .map((item) => item.getAsFile())
      .filter((item) => item !== null)
      .value()
  );
});

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

const Asset = {
  view({ attrs }) {
    const { id, kind } = attrs;
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

function Assets() {
  let assets = s({});

  const update = () => {
    console.log("update assets");
    return m
      .request({
        url: "//localhost:8000/assets/",
      })
      .then(assets);
  };

  this.attrs.reloadAssets?.map(update);

  return {
    oninit: update,
    view() {
      return [
        m(Uploads),
        m(
          "ul",
          _.map(assets(), (v) => m(Asset, v))
        ),
      ];
    },
  };
}

m.route(document.body, "/assets", {
  "/assets": {
    view() {
      return [
        m("h1", "GM Screen!"),
        m(Assets, { reloadAssets: uploads.uploadComplete }),
      ];
    },
  },
});
