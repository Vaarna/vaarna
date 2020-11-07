import m from "mithril";
import s from "mithril/stream";
import _, { method } from "lodash";
import { UploadsState, UploadList } from "./uploader";
import { AssetList } from "./component/asset_list";

const up = new UploadsState();

window.addEventListener("paste", (event) => {
  up.upload(
    _.chain(event.clipboardData.items)
      .map((item) => item.getAsFile())
      .filter((item) => item !== null)
      .value()
  );
});

const prevent = (event) => {
  event.preventDefault();
};

window.addEventListener("dragenter", prevent);
window.addEventListener("dragover", prevent);

window.addEventListener("drop", (event) => {
  event.preventDefault();

  up.upload(
    _.chain(event.dataTransfer.items)
      .map((item) => item.getAsFile())
      .filter((item) => item !== null)
      .value()
  );
});

m.route(document.body, "/assets", {
  "/assets": {
    view() {
      return [
        m("h1", "GM Screen!"),
        m(UploadList, { uploadsState: up }),
        m(AssetList, { uploadsState: up }),
      ];
    },
  },
});
