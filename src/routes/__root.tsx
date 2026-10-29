import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import React from "react";

import { Toaster } from "../components/ui/sonner";
import { useWebMCPTools } from "../hooks/use-webmcp-tools";
import { SITE_NAME, SITE_URL } from "../lib/seo";
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
        // iOS ignores SVG touch icons
        href: "/apple-touch-icon.png",
        rel: "apple-touch-icon",
        sizes: "180x180",
      },
      {
        href: "/manifest.json",
        rel: "manifest",
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
      // Titles, descriptions, canonicals and share cards are per page: see pageHead
      {
        content: "website",
        property: "og:type",
      },
      {
        content: SITE_NAME,
        property: "og:site_name",
      },
      {
        content: "summary_large_image",
        name: "twitter:card",
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
    "Free Secret Santa name drawing for 3 to 100 people",
    "No sign-up or account",
    "Matches by email, printable QR card, or private link; email is optional",
    "Exclusions so couples don't draw each other",
    "Organizer can run the exchange without playing",
    "Pre-filled setup links for chat assistants",
    "WebMCP tools for browser AI agents",
  ],
  description:
    "Free Secret Santa generator. No sign-up. Add people, set exclusions, and share matches by email, QR card, or private link.",
  name: SITE_NAME,
  url: SITE_URL,
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
