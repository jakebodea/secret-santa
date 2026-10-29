import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import React from "react";

import { Toaster } from "../components/ui/sonner";
import { useWebMCPTools } from "../hooks/use-webmcp-tools";
import { exchangeGuideTool } from "../lib/webmcp/guide";

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
        href: "https://fonts.googleapis.com",
        rel: "preconnect",
      },
      {
        crossOrigin: "anonymous",
        href: "https://fonts.gstatic.com",
        rel: "preconnect",
      },
      {
        // Linked here rather than @import-ed from CSS so it downloads in parallel
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Nunito+Sans:wght@300..700&display=swap",
        rel: "stylesheet",
      },
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
      // Agents find the WebMCP tools and workflow here instead of in page copy
      {
        href: "/llms.txt",
        rel: "alternate",
        title: "Instructions for AI agents (WebMCP)",
        type: "text/plain",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
        name: "viewport",
      },
      {
        content: "light",
        name: "color-scheme",
      },
      {
        // This app stays light in both OS schemes. Keep in sync with --background in styles.css
        content: "#fdf7f1",
        name: "theme-color",
      },
      {
        title: "Secret Santa - Organize Your Gift Exchange",
      },
      {
        content:
          "Free Secret Santa organizer. No account. Add people, set exclusions, and share matches by email, QR card, or private link.",
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
          "Free Secret Santa organizer. No account. Add people, set exclusions, and share matches by email, QR card, or private link.",
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
          "Free Secret Santa organizer. No account. Add people, set exclusions, and share matches by email, QR card, or private link.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  browserRequirements:
    "A WebMCP-compatible browser agent is required for AI agent tools. Manual setup works without WebMCP.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Free Secret Santa gift exchanges",
    "Participant exclusions",
    "Email assignments",
    "WebMCP tools for browser AI agents",
  ],
  description:
    "Free Secret Santa organizer. No account. Add people, set exclusions, and share matches by email, QR card, or private link.",
  name: "Secret Santa",
  url: "https://supersimplesecretsanta.com",
};

function RootDocument({ children }: { children: React.ReactNode }) {
  useWebMCPTools([exchangeGuideTool]);
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
        <div className="isolate">
          {/* Fixed edge strips Safari samples to tint its status bar and toolbar */}
          <div aria-hidden="true" className="edge-top" />
          <div aria-hidden="true" className="edge-bottom" />
          <LazyMotion features={domAnimation}>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </LazyMotion>
          <Toaster />
          <TanStackRouterDevtools />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
