import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Track your wedding guests, their travel details, PNR status, and set arrival reminders. A beautiful dashboard to manage your big day." />
        <meta name="keywords" content="wedding, guest tracker, PNR, train tracking, travel, reminders, shaadi" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta property="og:title" content="Shaadi Guest Tracker" />
        <meta property="og:description" content="Track wedding guests, travel PNRs, and arrival reminders" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Shaadi Guest Tracker" />
        <meta name="twitter:description" content="Track wedding guests, travel PNRs, and arrival reminders" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
