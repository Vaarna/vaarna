import { AppProps } from "next/app";
import React from "react";
import { ThemeProvider } from "styled-components";

import { GlobalStyle } from "@gm-screen/all/dist/globalStyle";
import { wrapper } from "@gm-screen/all/dist/state/store";
import { defaultTheme } from "@gm-screen/all/dist/theme";

const WrappedApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const C = Component as any;

  // TODO: find out why the type of Component cannot be used here...
  return (
    <ThemeProvider theme={defaultTheme}>
      <C {...pageProps} />
      <GlobalStyle />
    </ThemeProvider>
  );
};

export default wrapper.withRedux(WrappedApp);
