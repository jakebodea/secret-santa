/**
 * Per-page search and share tags. Every route's `head` goes through `pageHead`
 * so each page gets its own canonical URL, title, description and share card.
 * The root route sets none of these: a canonical there would point every page
 * at the home page, and search engines would drop the rest.
 */

/** The public site. Canonicals and share cards always point here, never at a preview. */
export const SITE_URL = "https://supersimplesecretsanta.com";
export const SITE_NAME = "Super Simple Secret Santa";

/** Google cuts titles at roughly 60 characters. */
export const TITLE_MAX = 60;
/** Google shows up to about 160 characters; stay under to avoid a mid-word cut. */
export const DESCRIPTION_MAX = 155;
export const DESCRIPTION_MIN = 50;

/**
 * `"<page> | <site>"`, dropping the site suffix when it would push the title
 * past {@link TITLE_MAX}: the page name is what searchers read first.
 */
export const documentTitle = (page: string): string => {
  const full = `${page} | ${SITE_NAME}`;
  return full.length <= TITLE_MAX ? full : page;
};

/** 1200x630 share card, rendered from `scripts/og/og-image.svg`. */
const SHARE_IMAGE = `${SITE_URL}/og.png`;

interface IndexedPage {
  path: `/${string}`;
  /** The page's own name; `documentTitle` adds the site name when it fits. */
  title: string;
  description: string;
}

interface HiddenPage {
  title: string;
  /** Private or app-state pages: keep them out of search results. */
  noindex: true;
}

export function pageHead(page: IndexedPage | HiddenPage) {
  if ("noindex" in page) {
    return {
      meta: [
        { title: page.title },
        { content: "noindex, nofollow", name: "robots" },
      ],
    };
  }

  const url = new URL(page.path, SITE_URL).href;
  const title = documentTitle(page.title);
  return {
    links: [{ href: url, rel: "canonical" }],
    meta: [
      { title },
      { content: page.description, name: "description" },
      { content: title, property: "og:title" },
      { content: page.description, property: "og:description" },
      { content: url, property: "og:url" },
      { content: SHARE_IMAGE, property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: title, name: "twitter:title" },
      { content: page.description, name: "twitter:description" },
      { content: SHARE_IMAGE, name: "twitter:image" },
    ],
  };
}
