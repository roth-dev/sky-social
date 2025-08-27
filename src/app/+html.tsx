import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="title" content="Sky Social - BlueSky Client" />
        <meta
          name="description"
          content="Sky Social - Connect and share with your friends and the world."
        />
        <meta
          name="keywords"
          content="social, network, sky, friends, sharing"
        />
        <meta name="author" content="Sky Social Team" />
        <meta name="theme-color" content="#317EFB" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sky-social--bsky.expo.app/" />
        <meta property="og:title" content="Sky Social" />
        <meta
          property="og:description"
          content="Connect and share with your friends and the world on Sky Social."
        />
        <meta
          property="og:image"
          content="https://sky-social--bsky.expo.app/assets/images/icon.png"
        />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://sky-social--bsky.expo.app/" />
        <meta name="twitter:title" content="Sky Social" />

        <meta
          name="twitter:description"
          content="Connect and share with your friends and the world on Sky Social."
        />
        <meta
          name="twitter:image"
          content="https://sky-social--bsky.expo.app/assets/images/icon.png"
        />

        {/* Favicon */}
        <link
          rel="icon"
          href="https://sky-social--bsky.expo.app/assets/images/favicon.png"
        />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}
