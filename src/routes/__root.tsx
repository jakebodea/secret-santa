import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import React from "react";

import appCss from "../styles.css?url";

// Lazy load devtools only in development
const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(async () => {
        const res = await import("@tanstack/react-router-devtools");
        return { default: res.TanStackRouterDevtools };
      });

export const Route = createRootRoute({
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
      {
        href: "/gift.svg",
        rel: "icon",
        type: "image/svg+xml",
      },
      {
        href: "/gift.svg",
        rel: "apple-touch-icon",
      },
      {
        href: "/manifest.json",
        rel: "manifest",
      },
      {
        href: "https://supersimplesecretsanta.com",
        rel: "canonical",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "Secret Santa - Organize Your Gift Exchange",
      },
      {
        content:
          "Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.",
        name: "description",
      },
      {
        content:
          "secret santa, simple secret santa, secret santa free, gift exchange, christmas, holiday, gift organizer, random assignment",
        name: "keywords",
      },
      {
        content: "Secret Santa - Organize Your Gift Exchange",
        property: "og:title",
      },
      {
        content:
          "Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.",
        property: "og:description",
      },
      {
        content: "website",
        property: "og:type",
      },
      {
        content: "/gift.svg",
        property: "og:image",
      },
      {
        content: "https://supersimplesecretsanta.com",
        property: "og:url",
      },
      {
        content: "summary",
        name: "twitter:card",
      },
      {
        content: "Secret Santa - Organize Your Gift Exchange",
        name: "twitter:title",
      },
      {
        content:
          "Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.",
        name: "twitter:description",
      },
      {
        content: "/gift.svg",
        name: "twitter:image",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description:
      "Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.",
    name: "Secret Santa",
    url: "https://supersimplesecretsanta.com",
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          // oxlint-disable-next-line react/no-danger -- static JSON-LD we build ourselves
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools />
        <Scripts />
      </body>
    </html>
  );
}
