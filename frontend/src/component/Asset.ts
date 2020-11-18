import m from "mithril";

type Asset = {
  id: string;
  filename: string;
  kind: string;
};

type Autoplay = {
  autoplay?: boolean;
};

const ImageAsset = ({ id, filename }: Asset) =>
  m("img", {
    src: `/assets/show/${id}`,
    alt: filename,
  });

const VideoAsset = ({ id, autoplay = false }: Asset & Autoplay) =>
  m("video", {
    src: `/assets/show/${id}`,
    controls: !autoplay,
    loop: true,
    autoplay,
  });

const AudioAsset = ({ id, autoplay = false }: Asset & Autoplay) =>
  m("audio", {
    src: `/assets/show/${id}`,
    controls: !autoplay,
    loop: true,
    autoplay,
  });

const OtherAsset = ({ id, filename }: Asset) =>
  m("a", { href: `/assets/show/${id}` }, filename);

export default (asset: Asset & Autoplay) => {
  const { kind } = asset;
  const el =
    kind == "image"
      ? ImageAsset
      : kind == "video"
      ? VideoAsset
      : kind == "audio"
      ? AudioAsset
      : OtherAsset;

  return m(".asset", el(asset));
};
