import "normalize.css";
import "../styles/index.scss";

import type { AppProps } from "next/app";

import Header from "component/Header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <div className="content">
        <Component {...pageProps} />
      </div>
    </>
  );
}
