import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="nl">
      <Head>
        <link rel="icon" href="/favicon-1.png" />
        <meta name="theme-color" content="#10b981" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}