import "normalize.css/normalize.css";
import "../styles/reset.css";
import "../styles/master.css";

import type { AppProps } from "next/app";
import { Header } from "component/Header";

export default function App({ Component, pageProps }: AppProps): React.ReactNode {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}
