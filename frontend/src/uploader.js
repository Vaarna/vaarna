import m from "mithril";
import s from "mithril/stream";
import _ from "lodash";
import { randomId } from "./utils";

export class UploadsState {
  constructor(removeDelay = 1000) {
    this._removeDelay = removeDelay;

    this.state = s([]);
    this.uploadComplete = s();
  }

  create({ id, loaded = 0, total = null }) {
    this.state([...this.state(), { id, loaded, total }]);
  }

  update({ id, loaded, total }) {
    this.state(
      this.state().map((v) => {
        if (v.id !== id) return v;

        v.loaded = loaded;
        v.total = total;
        return v;
      })
    );
  }

  remove({ id }) {
    this.state(this.state().filter((v) => v.id !== id));
    this.uploadComplete(id);
  }

  _config(id) {
    const update = (event) => {
      this.update({ id, loaded: event.loaded, total: event.total });
      m.redraw();
    };
    const done = (event) => {
      m.redraw();
      setTimeout(() => {
        this.remove({ id });
        m.redraw();
      }, this._removeDelay);
    };

    return (xhr) => {
      xhr.addEventListener("loadstart", update);
      xhr.addEventListener("progress", update);
      xhr.addEventListener("load", done);

      return xhr;
    };
  }

  upload(files) {
    const ps = files.map((file) => {
      const body = new FormData();
      body.append("files", file);

      const id = randomId();

      this.create({ id, total: file.size });

      return m.request({
        url: `//localhost:8000/assets/`,
        method: "POST",
        config: this._config(id),
        body,
      });
    });

    return Promise.all(ps).then(_.flatten);
  }
}

export const UploadList = {
  view({ attrs: { uploadsState } }) {
    const uploadsElements = uploadsState
      .state()
      .map(({ id, loaded, total }) =>
        m(".upload", [m("p", id), m("progress", { value: loaded, max: total })])
      );

    return m(".uploads", uploadsElements);
  },
};
