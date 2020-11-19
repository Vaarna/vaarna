import m from "mithril";

type Asset = {
  id: string;
  filename: string;
  kind: string;
};

type Extra = {
  autoplay?: boolean;
};

const src = (space_id: string, asset_id: string) =>
  `/assets/show/${asset_id}?space_id=${space_id}`;

const ImageAsset = (src: string, { filename }: Asset & Extra) =>
  m("img", {
    src,
    alt: filename,
  });

const VideoAsset = (src: string, { autoplay = false }: Asset & Extra) =>
  m("video", {
    src,
    controls: !autoplay,
    loop: true,
    autoplay,
  });

const AudioAsset = (src: string, { autoplay = false }: Asset & Extra) =>
  m("audio", {
    src,
    controls: !autoplay,
    loop: true,
    autoplay,
  });

const OtherAsset = (href: string, { filename }: Asset) =>
  m("a", { href }, filename);

export default (space_id: string, asset: Asset & Extra) => {
  const { kind } = asset;
  const el =
    kind == "image"
      ? ImageAsset
      : kind == "video"
      ? VideoAsset
      : kind == "audio"
      ? AudioAsset
      : OtherAsset;

  return m(".asset", el(src(space_id, asset.id), asset));
};
