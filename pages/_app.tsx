import "../styles/_all.scss";

import type { AppProps } from "next/app";
import { v4 as v4uuid } from "uuid";

import Head from "next/head";
import { Header } from "component/Header";
import { useFileUpload } from "hook/useFileUpload";
import axios from "axios";
import { useSpaceId } from "store";
import { z } from "zod";
import { useState } from "react";
import { rootLogger } from "logger";
import { useRouter } from "next/router";
import { UploadContext, UploadProgress } from "context/UploadProgress";

const ProgressEvent = z.object({
  type: z.literal("progress"),
  timeStamp: z.number(),
  loaded: z.number(),
  total: z.number(),
});

export default function App({ Component, pageProps }: AppProps): React.ReactNode {
  const router = useRouter();
  const { query } = router;
  const [spaceId, setSpaceId] = useSpaceId<string>();

  if (typeof query.spaceId === "string" && query.spaceId.length > 0) {
    if (query.spaceId !== spaceId) {
      setSpaceId(query.spaceId);
    }
  }

  if (Array.isArray(query.spaceId) && query.spaceId.length > 0) {
    const s = query.spaceId[query.spaceId.length - 1];
    if (s !== spaceId) {
      setSpaceId(s);
    }
  }

  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const onUploadProgress =
    (id: string) =>
    (ev: unknown): void => {
      const evParsed = ProgressEvent.safeParse(ev);
      if (!evParsed.success) throw evParsed.error;
      const progress = evParsed.data;
      const { loaded, total } = progress;

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
        const id = v4uuid();
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
          .post("/api/asset", fd, {
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
      })
    )
      .then((v) => rootLogger.info("succesfully uploaded %s files", v.length))
      .catch((err) => rootLogger.error(err, "uploading files failed"));
  });

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Roboto+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <UploadContext.Provider value={uploads}>
        <Header />

        <Component {...pageProps} />
      </UploadContext.Provider>
    </>
  );
}
