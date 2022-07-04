import { useEffect } from "react";

type Upload = (files: File[]) => void;

const files = (files: DataTransferItemList | undefined): File[] =>
  files === undefined
    ? []
    : Object.values(files)
        .map((item) => item.getAsFile())
        .filter((item): item is File => item !== null);

const prevent = (ev: Event) => {
  ev.preventDefault();
};

const _paste = (upload: Upload) => (ev: ClipboardEvent) => {
  const items = ev.clipboardData?.items;
  if (items === undefined) return;

  const fs = files(items);
  if (fs.length === 0) return;

  upload(fs);
  ev.preventDefault();
};

const _drop = (upload: Upload) => (ev: DragEvent) => {
  const items = ev.dataTransfer?.items;
  if (items === undefined) return;

  const fs = files(items);
  if (fs.length === 0) return;

  upload(fs);
  ev.preventDefault();
};

export const useFileUpload = (upload: Upload): void => {
  useEffect(() => {
    const paste = _paste(upload);
    const drop = _drop(upload);

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
  }, [upload]);
};
