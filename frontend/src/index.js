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
        m(Notify),
        m(UploadList, { uploadsState: up }),
        m(AssetList, { uploadsState: up }),
      ];
    },
  },
});

function Notify() {
  const uri = (client_id) => {
    const loc = window.location;
    let new_uri = undefined;
    if (loc.protocol === "https:") {
      new_uri = "wss:";
    } else {
      new_uri = "ws:";
    }
    new_uri += "//" + loc.host;
    new_uri += loc.pathname + `notify/?client_id=${client_id}`;
    return new_uri;
  };

  const client_id = s("CLIENT ID");
  const connected = s(false);
  const currentAsset = s();
  const socket = s();
  const connect = (client_id) => {
    const s = new WebSocket(uri(client_id));

    s.addEventListener("open", function (event) {
      console.log("socket opened");
    });

    s.addEventListener("message", function (event) {
      console.log(event.data);
      const msg = JSON.parse(event.data);
      console.log("Message from server ", msg);

      if (msg.kind === "show-asset") {
        currentAsset(msg.data.asset_id);
      }

      m.redraw();
    });

    connected(true);
    socket(s);
    m.redraw();
  };

  return {
    view() {
      if (connected()) {
        return m("img", { src: `/assets/${currentAsset()}` });
      }

      return [
        m("input", {
          oninput: (e) => {
            client_id(e.target.value);
          },
          value: client_id(),
        }),
        m("button", { onclick: (e) => connect(client_id()) }, "CONNECT"),
      ];
    },
  };
}
