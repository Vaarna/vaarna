import "normalize.css";
import "../styles/index.scss";
import s from "./_app.module.css";

import type { AppProps } from "next/app";
import { v4 as v4uuid } from "uuid";

import Head from "next/head";
import { Header } from "component/Header";
import { useFileUpload } from "hook/useFileUpload";
import axios from "axios";
import { useSpaceId } from "store";
import { z } from "zod";
import { UploadProgress, UploadProgressProps } from "component/UploadProgress";
import { useState } from "react";
import { rootLogger } from "logger";

const ProgressEvent = z.object({
  type: z.literal("progress"),
  timeStamp: z.number(),
  loaded: z.number(),
  total: z.number(),
});

export default function App({ Component, pageProps }: AppProps): React.ReactNode {
  const [spaceId, _] = useSpaceId<string>();

  const [showUploads, setShowUploads] = useState(false);
  const [uploads, setUploads] = useState<
    (Omit<UploadProgressProps, "parentId"> & { id: string })[]
  >([]);

  const onUploadProgress = (id: string) => (ev: unknown): void => {
    const evParsed = ProgressEvent.safeParse(ev);
    if (!evParsed.success) throw evParsed.error;
    const progress = evParsed.data;
    const { loaded, total } = progress;

    setUploads((prev) => prev.map((v) => (v.id !== id ? v : { ...v, loaded, total })));

    return;
  };

  const onUploadDone = (id: string) => {
    setUploads((prev) => prev.map((v) => (v.id !== id ? v : { ...v, done: true })));

    setTimeout(() => {
      setUploads((prev) => prev.filter((v) => v.id !== id));
      if (uploads.length === 0) setShowUploads(false);
    }, 5_000);
  };

  useFileUpload((files) => {
    const id = v4uuid();

    const fs: UploadProgressProps["files"] = [];
    let total = 0;
    const fd = new FormData();
    files.forEach((file, idx) => {
      fs.push({
        key: file.name + file.size + file.lastModified + file.type + idx,
        filename: file.name,
        size: file.size,
      });
      total += file.size;
      fd.append(`${idx}-${id}`, file, file.name);
    });

    setUploads((prev) => [...prev, { id, files: fs, loaded: 0, total, done: false }]);
    setShowUploads(true);

    return axios
      .post("/api/v1/asset", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { spaceId },
        onUploadProgress: onUploadProgress(id),
      })
      .then(() => {
        onUploadDone(id);
      })
      .catch((err) => {
        rootLogger.error(err, "failed to upload file");
      });
  });

  const uploadProgress = (
    <div
      className={s.uploadProgressContainer}
      onClick={() => {
        setShowUploads(false);
      }}
      style={{ visibility: !showUploads ? "hidden" : undefined }}
    >
      <div
        id={s.uploadProgressRoot}
        onClick={(ev) => {
          ev.stopPropagation();
        }}
      />
    </div>
  );

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Roboto+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className={s.root}>
        <Header
          showUploads={() => {
            setShowUploads(true);
          }}
        />

        <div className={s.content}>
          <Component {...pageProps} />
        </div>

        {uploadProgress}
        {Object.values(uploads).map((props) => (
          <UploadProgress key={props.id} parentId={s.uploadProgressRoot} {...props} />
        ))}
      </div>
    </>
  );
}
