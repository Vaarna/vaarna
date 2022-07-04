import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="GM Screen is an online tool to help Game Masters run their games, online or offline."
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
