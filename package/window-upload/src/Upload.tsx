import axios from "axios";
import React, { useState } from "react";
import { z } from "zod";

import { rootLogger } from "@vaarna/logging";
import { uuid } from "@vaarna/util";

import { UploadContext, UploadProgress } from "./UploadProgress";
import { useFileUpload } from "./useFileUpload";

const ProgressEvent = z.object({
  type: z.literal("progress"),
  timeStamp: z.number(),
  loaded: z.number(),
  total: z.number(),
});

export type UploadProps = React.PropsWithChildren<{
  url: string;
  params: Record<string, string>;
}>;

export const Upload: React.FC<UploadProps> = ({ url, params, children }) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const onUploadProgress =
    (id: string) =>
    (ev: unknown): void => {
      const evParsed = ProgressEvent.parse(ev);
      const { loaded, total } = evParsed;

      setUploads((prev) =>
        prev.map((v) => (v.id !== id ? v : { ...v, loaded, total }))
      );

      return;
    };

  const onUploadDone = (id: string) => {
    setUploads((prev) => prev.map((v) => (v.id !== id ? v : { ...v, done: true })));

    setTimeout(() => {
      setUploads((prev) => prev.filter((v) => v.id !== id));
    }, 5_000);
  };

  useFileUpload((files) => {
    Promise.all(
      files.map((file) => {
        const id = uuid();
        const fd = new FormData();
        fd.append("file", file, file.name);

        setUploads((prev) => [
          ...prev,
          {
            id,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            loaded: 0,
            total: file.size,
            done: false,
          },
        ]);

        return axios
          .post(url, fd, {
            headers: { "Content-Type": "multipart/form-data" },
            params,
            onUploadProgress: onUploadProgress(id),
          })
          .then(() => {
            onUploadDone(id);
          })
          .catch((err) => {
            rootLogger.error(err, "failed to upload file");
          });
      })
    )
      .then((v) => rootLogger.info("succesfully uploaded %s files", v.length))
      .catch((err) => rootLogger.error(err, "uploading files failed"));
  });

  return <UploadContext.Provider value={uploads}>{children}</UploadContext.Provider>;
};
