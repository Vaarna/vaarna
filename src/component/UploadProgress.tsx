import bytes from "bytes";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { round } from "util/round";
import { Loading } from "./atom/Loading";

import s from "./UploadProgress.module.css";

export type UploadProgressProps = {
  parentId: string;
  files: {
    key: string;
    filename: string;
    size: number;
  }[];
  loaded: number;
  total: number;
  done: boolean;
};

export const UploadProgress: React.FC<UploadProgressProps> = ({
  parentId,
  loaded,
  total,
  files,
  done,
}: UploadProgressProps) => {
  const [container, setContainer] = useState<Element | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const parentElem = document.getElementById(parentId);
    if (!parentElem) return;

    const rootContainer = document.createElement("div");
    rootContainer.className = s.container;
    parentElem.appendChild(rootContainer);
    setContainer(rootContainer);

    return () => {
      if (rootContainer) parentElem.removeChild(rootContainer);
    };
  }, [parentId]);

  const el = (
    <div>
      {files.map((file) => (
        <div key={file.key} className={s.file}>
          {file.filename} {bytes(file.size)}
        </div>
      ))}
      <label>
        {round((loaded / total) * 100, 2)}% ({bytes(loaded)} / {bytes(total)})
        <br />
        {done ? (
          <p>File(s) uploaded!</p>
        ) : loaded >= total ? (
          <>
            <p>Server is processing file(s).</p>
            <Loading slow small />
          </>
        ) : (
          <progress style={{ width: "100%" }} value={loaded} max={total} />
        )}
      </label>
    </div>
  );

  return container ? createPortal(el, container) : null;
};
