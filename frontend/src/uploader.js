import m from "mithril";
import s from "mithril/stream";
import _ from "lodash";
import { Base64 } from "js-base64";

function randomId() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Base64.fromUint8Array(array);
}

export const uploads = {
  state: s([]),
  uploadComplete: s(),
  create({ id, loaded = null, total = null }) {
    this.state([...this.state(), { id, loaded, total }]);
  },
  update({ id, loaded, total }) {
    this.state(
      this.state().map((v) => {
        if (v.id !== id) return v;

        v.loaded = loaded;
        v.total = total;
        return v;
      })
    );
  },
  remove({ id }) {
    this.state(this.state().filter((v) => v.id !== id));
    this.uploadComplete(id);
  },
};

export function uploadAssets(files) {
  return Promise.all(
    files.map((file) => {
      const body = new FormData();
      body.append("files", file);

      const id = randomId();

      uploads.create({ id });

      const config = (xhr) => {
        const update = (event) => {
          uploads.update({ id, loaded: event.loaded, total: event.total });
          m.redraw();
        };
        const done = (event) => {
          m.redraw();
          setTimeout(() => {
            uploads.remove({ id });
            m.redraw();
          }, 2500);
        };

        xhr.addEventListener("loadstart", update);
        xhr.addEventListener("progress", update);
        xhr.addEventListener("load", done);

        return xhr;
      };

      return m.request({
        url: `//localhost:8000/assets/`,
        method: "POST",
        config,
        body,
      });
    })
  ).then((v) => _.flatten(v));
}

export function Uploads() {
  return {
    view() {
      const uploadsElements = uploads
        .state()
        .map(({ id, loaded, total }) =>
          m(".upload", [
            m("p", id),
            m("progress", { value: loaded, max: total }),
          ])
        );

      return m(".uploads", uploadsElements);
    },
  };
}
