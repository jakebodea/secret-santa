/**
 * Rendered-HTML SEO rules, checked the way a crawler reads the page. Pure, so
 * `seo-audit.test.ts` covers it; `seo.ts` crawls a stage and feeds pages in.
 * A slim port of `sites/packages/control-app/src/seo.ts`, limited to what this
 * app has: no CMS, breadcrumbs or image pipeline.
 */
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  TITLE_MAX,
} from "../../src/lib/seo.ts";

export interface Finding {
  readonly path: string;
  readonly rule: string;
  readonly detail: string;
}

export interface Page {
  readonly path: string;
  readonly html: string;
}

type Attributes = Record<string, string>;

const TAG = /<(?<name>meta|link|img|a)\b(?<attributes>[^>]*)>/giu;
const ATTRIBUTE = /(?<key>[\w:-]+)(?:="(?<value>[^"]*)")?/gu;
const TITLE = /<title>(?<text>[^<]*)<\/title>/iu;
const H1 = /<h1\b/giu;
const JSON_LD =
  /<script type="application\/ld\+json">(?<json>[\s\S]*?)<\/script>/giu;

const decode = (text: string): string =>
  text
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

const tags = (html: string, name: string): Attributes[] =>
  [...html.matchAll(TAG)]
    .filter((match) => match.groups?.name?.toLowerCase() === name)
    .map((match) =>
      Object.fromEntries(
        [...(match.groups?.attributes ?? "").matchAll(ATTRIBUTE)].map(
          (attribute) => [
            attribute.groups?.key?.toLowerCase() ?? "",
            decode(attribute.groups?.value ?? ""),
          ]
        )
      )
    );

const metaContent = (html: string, key: string): string | undefined =>
  tags(html, "meta").find((meta) => meta.name === key || meta.property === key)
    ?.content;

export const pageTitle = (html: string): string | undefined => {
  const title = TITLE.exec(html)?.groups?.text;
  return title === undefined ? undefined : decode(title);
};

export const pageDescription = (html: string): string | undefined =>
  metaContent(html, "description");

export const isNoindex = (html: string): boolean =>
  metaContent(html, "robots")?.includes("noindex") ?? false;

/** Same-origin paths this page links to with a real `<a href>`. */
export const internalLinks = (html: string): string[] =>
  tags(html, "a")
    .map((anchor) => anchor.href ?? "")
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .map((href) => href.split(/[?#]/u)[0] ?? href);

type Check = (
  html: string,
  path: string,
  siteUrl: string
) => [string, string][];

const checkTitle: Check = (html) => {
  const title = pageTitle(html);
  if (title === undefined || title.trim() === "") {
    return [["title", "missing <title>"]];
  }
  return title.length > TITLE_MAX
    ? [["title", `${title.length} chars (keep within ${TITLE_MAX})`]]
    : [];
};

const checkDescription: Check = (html) => {
  const description = pageDescription(html);
  if (description === undefined) {
    return [["meta-description", "missing meta description"]];
  }
  const fits =
    description.length >= DESCRIPTION_MIN &&
    description.length <= DESCRIPTION_MAX;
  return fits
    ? []
    : [
        [
          "meta-description",
          `${description.length} chars (want ${DESCRIPTION_MIN}–${DESCRIPTION_MAX})`,
        ],
      ];
};

const checkCanonical: Check = (html, path, siteUrl) => {
  const canonicals = tags(html, "link")
    .filter((link) => link.rel === "canonical")
    .map((link) => link.href);
  const expected = new URL(path, siteUrl).href;
  return canonicals.length === 1 && canonicals[0] === expected
    ? []
    : [
        [
          "canonical",
          `want exactly one canonical ${expected}, got ${canonicals.join(", ") || "none"}`,
        ],
      ];
};

const checkHeadings: Check = (html) => {
  const h1s = html.match(H1)?.length ?? 0;
  return h1s === 1 ? [] : [["one-h1", `${h1s} <h1> elements`]];
};

const checkIndexable: Check = (html) =>
  isNoindex(html) ? [["indexable", "sitemap page has noindex"]] : [];

const checkSocial: Check = (html) => {
  const found: [string, string][] = [];
  const image = metaContent(html, "og:image");
  if (!image?.startsWith("https://")) {
    found.push([
      "social-image",
      `og:image must be an absolute https URL: ${image ?? "missing"}`,
    ]);
  }
  if (metaContent(html, "og:title") === undefined) {
    found.push(["social-image", "missing og:title"]);
  }
  const card = metaContent(html, "twitter:card");
  if (card !== "summary_large_image") {
    found.push([
      "social-image",
      `twitter:card is ${card ?? "missing"}; want summary_large_image`,
    ]);
  }
  return found;
};

const checkImages: Check = (html) =>
  tags(html, "img").flatMap((image): [string, string][] => [
    ...("alt" in image
      ? []
      : [["image-alt", `no alt: ${image.src ?? "?"}`] as [string, string]]),
    ...(image.width && image.height
      ? []
      : [
          ["no-layout-shift", `no width/height: ${image.src ?? "?"}`] as [
            string,
            string,
          ],
        ]),
  ]);

const validJson = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

const checkStructuredData: Check = (html) =>
  [...html.matchAll(JSON_LD)]
    .filter((match) => !validJson(match.groups?.json ?? ""))
    .map(() => ["structured-data", "invalid JSON-LD"]);

const CHECKS: readonly Check[] = [
  checkTitle,
  checkDescription,
  checkCanonical,
  checkHeadings,
  checkIndexable,
  checkSocial,
  checkImages,
  checkStructuredData,
];

/** Per-page rules for an indexable page; `siteUrl` is where canonicals must point. */
export const auditPage = (page: Page, siteUrl: string): Finding[] =>
  CHECKS.flatMap((check) =>
    check(page.html, page.path, siteUrl).map(([rule, detail]) => ({
      detail,
      path: page.path,
      rule,
    }))
  );

/** Rules across the whole site: unique titles and descriptions, no orphans. */
export const auditSite = (
  pages: readonly Page[],
  siteUrl: string
): Finding[] => {
  const findings = pages.flatMap((page) => auditPage(page, siteUrl));
  const duplicates = (
    rule: string,
    value: (html: string) => string | undefined
  ) => {
    const seen = new Map<string, string>();
    for (const page of pages) {
      const text = value(page.html);
      if (text === undefined) {
        continue;
      }
      const first = seen.get(text);
      if (first === undefined) {
        seen.set(text, page.path);
      } else {
        findings.push({ detail: `same as ${first}`, path: page.path, rule });
      }
    }
  };
  duplicates("unique-title", pageTitle);
  duplicates("unique-description", pageDescription);

  const linked = new Set(pages.flatMap((page) => internalLinks(page.html)));
  for (const page of pages) {
    if (page.path !== "/" && !linked.has(page.path)) {
      findings.push({
        detail: "in the sitemap but no page links to it",
        path: page.path,
        rule: "no-orphans",
      });
    }
  }
  return findings;
};
