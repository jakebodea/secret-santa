import { describe, expect, it } from "vitest";

import { auditPage, auditSite, internalLinks } from "./seo-audit.ts";

const SITE = "https://example.com";
const description =
  "A description long enough to land inside the search snippet budget.";

const html = ({
  canonical = `${SITE}/`,
  title = "Home | Example",
  body = '<h1>Hi</h1><a href="/about">About</a>',
  extra = "",
} = {}) =>
  `<html><head><title>${title}</title><meta content="${description}" name="description"/><link href="${canonical}" rel="canonical"/><meta content="${SITE}/og.png" property="og:image"/><meta content="${title}" property="og:title"/><meta content="summary_large_image" name="twitter:card"/>${extra}</head><body>${body}</body></html>`;

describe(auditPage, () => {
  it("passes a complete page", () => {
    expect(auditPage({ html: html(), path: "/" }, SITE)).toStrictEqual([]);
  });

  it("flags a canonical that points at another page", () => {
    const findings = auditPage({ html: html(), path: "/about" }, SITE);
    expect(findings.map((finding) => finding.rule)).toStrictEqual([
      "canonical",
    ]);
  });

  it("flags long titles, missing H1s, noindex and unsized images", () => {
    const rules = auditPage(
      {
        html: html({
          body: '<img src="/a.svg"/>',
          extra: '<meta content="noindex, nofollow" name="robots"/>',
          title: "x".repeat(61),
        }),
        path: "/",
      },
      SITE
    ).map((finding) => finding.rule);
    expect(rules).toStrictEqual([
      "title",
      "one-h1",
      "indexable",
      "image-alt",
      "no-layout-shift",
    ]);
  });
});

describe(auditSite, () => {
  it("flags orphans and duplicate titles", () => {
    const findings = auditSite(
      [
        { html: html({ body: "<h1>Hi</h1>" }), path: "/" },
        { html: html({ canonical: `${SITE}/about` }), path: "/about" },
      ],
      SITE
    );
    expect(
      findings.map((finding) => `${finding.path} ${finding.rule}`)
    ).toStrictEqual(["/about unique-title", "/about unique-description"]);
  });
});

describe(internalLinks, () => {
  it("keeps same-origin paths without query or hash", () => {
    expect(
      internalLinks(
        '<a href="/assign?x=1">a</a><a href="https://x.com">b</a><a href="//cdn">c</a>'
      )
    ).toStrictEqual(["/assign"]);
  });
});
