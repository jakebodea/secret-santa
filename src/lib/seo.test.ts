import { describe, expect, it } from "vitest";

import { documentTitle, pageHead } from "./seo";

describe(pageHead, () => {
  it("points each page's canonical and share URL at itself", () => {
    const head = pageHead({
      description: "d",
      path: "/support",
      title: "t",
    });
    expect(head.links).toStrictEqual([
      { href: "https://supersimplesecretsanta.com/support", rel: "canonical" },
    ]);
    expect(head.meta).toContainEqual({
      content: "https://supersimplesecretsanta.com/support",
      property: "og:url",
    });
  });

  it("adds the site name only when the title stays within budget", () => {
    expect(documentTitle("Changelog")).toBe(
      "Changelog | Super Simple Secret Santa"
    );
    const long = "A page name long enough to push the suffix past sixty";
    expect(documentTitle(long)).toBe(long);
  });

  it("keeps hidden pages out of search with no canonical", () => {
    const head = pageHead({ noindex: true, title: "t" });
    expect("links" in head).toBeFalsy();
    expect(head.meta).toContainEqual({
      content: "noindex, nofollow",
      name: "robots",
    });
  });
});
