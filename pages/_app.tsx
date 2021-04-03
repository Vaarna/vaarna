import "normalize.css";
import "../styles/index.scss";
import s from "./_app.module.css";

import type { AppProps } from "next/app";

import Head from "next/head";
import { Header } from "component/Header";
import { useFileUpload } from "hook/useFileUpload";
import axios from "axios";
import { useSpaceId } from "store";

export default function App({ Component, pageProps }: AppProps) {
  const [spaceId, _] = useSpaceId();

  useFileUpload((files) => {
    const fd = new FormData();
    files.forEach((file, idx) => {
      fd.append("asset" + idx, file, file.name);
    });

    return axios
      .post("/api/v1/asset", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { spaceId },
      })
      .then((res) => {
        console.log("files uploaded", res);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Roboto+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header />
      <div className={s.content}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
