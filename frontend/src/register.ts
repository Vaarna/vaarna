import m from "mithril";

import * as master from "./state/master";
import * as space from "./state/space";

export function registerFileUploads(actions: master.Actions) {
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

  console.log("[file uploads] adding event listeners");

  document.body.addEventListener("paste", paste);
  window.addEventListener("dragenter", prevent);
  window.addEventListener("dragover", prevent);
  window.addEventListener("drop", drop);

  return () => {
    console.log("[file uploads] removing event listeners listeners");

    document.body.removeEventListener("paste", paste);
    window.removeEventListener("dragenter", prevent);
    window.removeEventListener("dragover", prevent);
    window.removeEventListener("drop", drop);
  };
}

const uri = (space_id: string) => {
  const loc = window.location;

  return (
    (loc.protocol === "https:" ? "wss:" : "ws:") +
    `//${loc.host}/notify/?space_id=${space_id}`
  );
};

export function registerNotifier(state: space.State, actions: master.Actions) {
  const open = (event: Event) => {
    console.log("[socket] opened", event);
    m.redraw();
  };

  const error = (event: Event) => {
    console.log("[socket] error", event);
  };

  const close = (event: CloseEvent) => {
    console.log("[socket] closed", event);
    setTimeout(() => {
      ws = connect();
    }, 500);
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

  const connect = () => {
    const notifyUri = uri(state.space());
    const ws = new WebSocket(notifyUri);
    console.log(`[socket] connecting to ${notifyUri}`);

    ws.addEventListener("open", open);
    ws.addEventListener("message", message);
    ws.addEventListener("error", error);
    ws.addEventListener("close", close);

    return ws;
  };

  let ws = connect();

  return () => {
    console.log("[socket] manually closing notifier");
    ws.removeEventListener("close", close);
    ws.close(1000);
  };
}
