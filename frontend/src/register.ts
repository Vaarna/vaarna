import _ from "lodash";
import m from "mithril";
import Stream from "mithril/stream";
import { Actions } from "./state/master";
import { randomId } from "./utils";

export function registerFileUploads(actions: Actions) {
  const uploadItems = (items: DataTransferItemList | undefined) => {
    if (!items) return;
    actions
      .upload(
        Object.values(items)
          .map((item) => item.getAsFile())
          .filter((item) => item !== null) as File[]
      )
      .then(actions.updateAssets);
  };

  const prevent = (event: Event) => {
    event.preventDefault();
  };

  const paste = (event: ClipboardEvent) => {
    uploadItems(event.clipboardData?.items);
  };
  const drop = (event: DragEvent) => {
    event.preventDefault();
    uploadItems(event.dataTransfer?.items);
  };

  document.body.addEventListener("paste", paste);
  window.addEventListener("dragenter", prevent);
  window.addEventListener("dragover", prevent);
  window.addEventListener("drop", drop);

  return () => {
    document.body.removeEventListener("paste", paste);
    window.removeEventListener("dragenter", prevent);
    window.removeEventListener("dragover", prevent);
    window.removeEventListener("drop", drop);
  };
}

const uri = (client_id: string) => {
  const loc = window.location;

  return (
    (loc.protocol === "https:" ? "wss:" : "ws:") +
    `//${loc.host}/notify/?client_id=${client_id}`
  );
};

export function registerNotifier(actions: Actions) {
  const connected = Stream(false);

  const open = (event: Event) => {
    console.log("[socket] opened", event);
    connected(true);
    m.redraw();
  };

  const error = (event: Event) => {
    // TODO: reopen socket after a delay
    console.log("[socket] error", event);
  };

  const close = (event: CloseEvent) => {
    // TODO: reopen socket after a delay
    console.log("[socket] closed", event);
  };

  const message = (event: MessageEvent<string>) => {
    const msg = JSON.parse(event.data);
    console.log("[socket] message", msg);

    const kind = msg.kind;

    switch (kind) {
      case "ping":
        return;
      case "show-asset":
        actions.showAsset(msg.data.asset_id);
    }

    m.redraw();
  };

  const notifyUri = uri(randomId());
  const ws = new WebSocket(notifyUri);
  console.log(`[socket] connecting to ${notifyUri}`);

  ws.addEventListener("open", open);
  ws.addEventListener("message", message);
  ws.addEventListener("error", error);
  ws.addEventListener("close", close);
}
