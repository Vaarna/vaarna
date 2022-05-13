import "normalize.css/normalize.css";
import "../styles/reset.css";
import "../styles/master.css";

import React from "react";
import { AppProps } from "next/app";
import { wrapper } from "state/store";

const WrappedApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const C = Component as any;

  // TODO: find out why the type of Component cannot be used here...
  return <C {...pageProps} />;
};

export default wrapper.withRedux(WrappedApp);
