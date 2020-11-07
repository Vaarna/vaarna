import m from "mithril";
import s from "mithril/stream";
import _, { method } from "lodash";
import { uploadAssets, uploads, Uploads } from "./uploader";

window.addEventListener("paste", (event) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData)
    .items;

  uploadAssets(
    _.chain(items)
      .map((item) => item.getAsFile())
      .filter((item) => item !== null)
      .value()
  );
});

document.body.addEventListener("dragenter", (event) => {
  console.log("dragenter", event);
  event.preventDefault();
  //event.stopPropagation();
});

document.body.addEventListener("dragover", (event) => {
  console.log("dragover", event);
  event.preventDefault();
  //event.stopPropagation();
});

document.body.addEventListener("drop", (event) => {
  console.log("ondrop", event);
  event.preventDefault();

  const items = (event.dataTransfer || event.originalEvent.dataTransfer).items;

  uploadAssets(
    _.chain(items)
      .map((item) => item.getAsFile())
      .filter((item) => item !== null)
      .value()
  );
});

const Asset = {
  view(vnode) {
    const {
      attrs: { id, filename, kind },
    } = vnode;

    return kind == "image" ? (
      <li key={id}>
        <p>{filename}</p>
        <img src={`//localhost:8000/assets/${id}`} />
      </li>
    ) : kind == "video" ? (
      <li key={id}>
        <p>{filename}</p>
        <video autoplay loop src={`//localhost:8000/assets/${id}`} />
      </li>
    ) : kind == "audio" ? (
      <li key={id}>
        <p>{filename}</p>
        <audio autoplay loop src={`//localhost:8000/assets/${id}`} />
      </li>
    ) : (
      <li key={id}>{filename}</li>
    );
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
      return (
        <>
          <Uploads />
          <ul>
            {_.map(assets(), (v) => (
              <Asset id={v.id} filename={v.filename} kind={v.kind} />
            ))}
          </ul>
        </>
      );
    },
  };
}

m.route(document.body, "/assets", {
  "/assets": {
    view() {
      return (
        <>
          <h1>GM Screen!</h1>
          <Assets reloadAssets={uploads.uploadComplete} />
        </>
      );
    },
  },
});
