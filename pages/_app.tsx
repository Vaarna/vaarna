import "normalize.css/normalize.css";
import "../styles/reset.css";
import "../styles/master.css";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps): React.ReactNode {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
