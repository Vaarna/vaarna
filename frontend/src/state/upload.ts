import m from "mithril";
import Stream from "mithril/stream";
import { randomId } from "../utils";

type Upload = {
  id: string;
  loaded: number;
  total: number;
};

export type State = Stream<Upload[]>;
export const State = () => Stream<Upload[]>([]);

export const Actions = (state: State) => {
  const createUpload = (upload: Upload) => {
    state([...state(), upload]);
  };

  const updateUpload = (upload: Upload) => {
    console.log(upload, state());
    state(state().map((v) => (v.id === upload.id ? upload : v)));
  };

  const removeUpload = (id: string) => {
    state(state().filter((v) => v.id !== id));
  };

  const config = (id: string) => {
    const update = (event: ProgressEvent) => {
      updateUpload({ id, loaded: event.loaded, total: event.total });
      m.redraw();
    };

    const done = () => {
      console.log(state());
      removeUpload(id);
      m.redraw();
    };

    return (xhr: XMLHttpRequest) => {
      xhr.upload.addEventListener("progress", update);
      xhr.upload.addEventListener("load", done);

      return xhr;
    };
  };

  const upload = (files: File[]): Promise<unknown[]> => {
    const ps = files.map((file) => {
      const body = new FormData();
      body.append("files", file);

      const id = randomId();

      createUpload({ id, loaded: 0, total: file.size });
      m.redraw();

      return m.request({
        url: "/assets",
        method: "POST",
        config: config(id),
        body,
      });
    });

    return Promise.all(ps).then((ps) => ps.flat());
  };

  return { upload };
};

export type Actions = ReturnType<typeof Actions>;
