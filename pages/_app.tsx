import type { AppProps } from "next/app"

import "normalize.css"
import "../styles/index.scss"

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
