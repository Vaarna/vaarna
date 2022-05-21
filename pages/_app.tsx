import React from "react";
import { AppProps } from "next/app";
import { wrapper } from "state/store";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "theme";
import { GlobalStyle } from "globalStyle";

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
