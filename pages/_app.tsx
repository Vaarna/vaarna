import "normalize.css";
import "../styles/index.scss";

import type { AppProps } from "next/app";
import { Store } from "store";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Store initialState={pageProps.initialState}>
      <Component {...pageProps} />
    </Store>
  );
}
