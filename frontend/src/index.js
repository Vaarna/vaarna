import m from "mithril";
import s from "mithril/stream";
import _ from "lodash";
import { UploadsState, UploadList } from "./uploader";
import { CurrentAsset } from "./component/asset";
import { AssetList } from "./component/asset_list";
import { randomId } from "./utils";
import { store, showAsset, setAssetList } from "./state";

function registerFileUploads(el, uploadsState) {
  el.addEventListener("paste", (event) => {
    uploadsState.upload(
      _.chain(event.clipboardData.items)
        .map((item) => item.getAsFile())
        .filter((item) => item !== null)
        .value()
    );
  });

  const prevent = (event) => {
    event.preventDefault();
  };

  el.addEventListener("dragenter", prevent);
  el.addEventListener("dragover", prevent);

  el.addEventListener("drop", (event) => {
    event.preventDefault();

    uploadsState.upload(
      _.chain(event.dataTransfer.items)
        .map((item) => item.getAsFile())
        .filter((item) => item !== null)
        .value()
    );
  });
}

class Notify {
  constructor() {
    this.connected = s(false);
    this.currentAsset = s();

    this.uri = this._uri(randomId());
    this.socket = new WebSocket(this.uri);
    console.log(`[socket] connecting to ${this.uri}`);

    this.socket.addEventListener("open", this._open.bind(this));
    this.socket.addEventListener("message", this._message.bind(this));
    this.socket.addEventListener("error", this._error.bind(this));
    this.socket.addEventListener("close", this._close.bind(this));
  }

  _uri(client_id) {
    const loc = window.location;

    return (
      (loc.protocol === "https:" ? "wss:" : "ws:") +
      `//${loc.host}/notify/?client_id=${client_id}`
    );
  }

  _open(event) {
    console.log("[socket] opened");
    this.connected(true);
    m.redraw();
  }

  _message(event) {
    const msg = JSON.parse(event.data);
    console.log("[socket] message", msg);

    const kind = msg.kind;

    switch (kind) {
      case "ping":
        return;
      case "show-asset":
        m.request({
          url: "/assets/:id",
          params: { id: msg.data.asset_id },
        })
          .then(showAsset)
          .then(store.dispatch);
    }
  }

  _error(event) {
    console.log("[socket] error", event);
  }

  _close(event) {
    console.log("[socket] closed");
  }

  showAsset(asset_id) {
    return m.request({
      url: "/notify/show-asset",
      method: "POST",
      params: { asset_id },
    });
  }
}

const uploadsState = new UploadsState();
const notify = new Notify();

registerFileUploads(window, uploadsState);

store.subscribe(m.redraw);

m.request({
  url: "/assets",
})
  .then(setAssetList)
  .then(store.dispatch);

m.route(document.body, "/assets", {
  "/assets": {
    view() {
      return [
        m("h1", "GM Screen!"),
        m(".current-asset", m(CurrentAsset)),
        m(UploadList, { uploadsState }),
        m(AssetList, { notify }),
      ];
    },
  },
});
