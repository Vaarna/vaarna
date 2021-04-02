import "normalize.css";
import "../styles/index.scss";

import type { AppProps } from "next/app";

import Header from "component/Header";
import { useFileUpload } from "hook/useFileUpload";
import axios from "axios";

export default function App({ Component, pageProps }: AppProps) {
  useFileUpload((files) => {
    const fd = new FormData();
    files.forEach((file, idx) => {
      fd.append("asset" + idx, file, file.name);
    });

    return axios
      .post("/api/v1/asset", fd, {
        headers: { "Content-Type": "multipart/form-data" },
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
      <Header />
      <div className="content">
        <Component {...pageProps} />
      </div>
    </>
  );
}
