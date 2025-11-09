import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'

import React from 'react'

// Lazy load devtools only in development
const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/react-router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      )

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Secret Santa - Organize Your Gift Exchange',
      },
      {
        name: 'description',
        content: 'Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.',
      },
      {
        name: 'keywords',
        content: 'secret santa, simple secret santa, secret santa free, gift exchange, christmas, holiday, gift organizer, random assignment',
      },
      {
        property: 'og:title',
        content: 'Secret Santa - Organize Your Gift Exchange',
      },
      {
        property: 'og:description',
        content: 'Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: '/gift.svg',
      },
      {
        property: 'og:url',
        content: 'https://supersecretsimplesanta.com',
      },
      {
        name: 'twitter:card',
        content: 'summary',
      },
      {
        name: 'twitter:title',
        content: 'Secret Santa - Organize Your Gift Exchange',
      },
      {
        name: 'twitter:description',
        content: 'Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.',
      },
      {
        name: 'twitter:image',
        content: '/gift.svg',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/gift.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'apple-touch-icon',
        href: '/gift.svg',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'canonical',
        href: 'https://supersecretsimplesanta.com',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Secret Santa',
    description: 'Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.',
    url: 'https://supersecretsimplesanta.com',
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools />
        <Scripts />
      </body>
    </html>
  )
}
