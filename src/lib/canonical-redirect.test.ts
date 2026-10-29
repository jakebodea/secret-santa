import { describe, expect, it } from "vitest";

import { canonicalRedirect } from "./canonical-redirect";

const ORIGIN = "https://example.com";
const location = (url: string, origin = ORIGIN) =>
  canonicalRedirect(new Request(url), origin)?.headers.get("location");

describe(canonicalRedirect, () => {
  it("sends www to the apex with path and query", () => {
    expect(location("https://www.example.com/assign?x=1")).toBe(
      "https://example.com/assign?x=1"
    );
    expect(
      canonicalRedirect(new Request("https://www.example.com/"), ORIGIN)?.status
    ).toBe(301);
  });

  it("never redirects off the site", () => {
    expect(location("https://www.example.com//evil.com/path")).toBe(
      "https://example.com//evil.com/path"
    );
  });

  it("upgrades plain HTTP on the apex", () => {
    expect(location("http://example.com/support")).toBe(
      "https://example.com/support"
    );
  });

  it("leaves the canonical origin, previews and local dev alone", () => {
    expect(location("https://example.com/")).toBeUndefined();
    expect(
      location("https://secret-santa-pr-1.jakebodea.workers.dev/")
    ).toBeUndefined();
    expect(
      location("http://localhost:4772/", "http://localhost:4772")
    ).toBeUndefined();
  });
});
