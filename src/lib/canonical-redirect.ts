/**
 * One public address: `www.<domain>` and plain HTTP on the domain answer 301
 * to `https://<domain>`, path and query kept. Done in the Worker because a zone
 * redirect rule needs permissions the CI deploy tokens deliberately lack.
 * Origins that are not HTTPS (local dev) and every other hostname (workers.dev
 * previews) pass through. Ported from `sites/packages/cloudflare-kit/src/emdash/canonical.ts`.
 */
const MOVED_PERMANENTLY = 301;

export const canonicalRedirect = (
  request: Request,
  siteOrigin: string
): Response | undefined => {
  const canonical = new URL(siteOrigin);
  if (canonical.protocol !== "https:") {
    return undefined;
  }
  const url = new URL(request.url);
  const www = url.hostname === `www.${canonical.hostname}`;
  const plainHttp =
    url.protocol === "http:" && url.hostname === canonical.hostname;
  if (!(www || plainHttp)) {
    return undefined;
  }
  // Set path and query on the canonical URL: resolving "//evil.com" as a
  // relative URL would leave the site.
  canonical.pathname = url.pathname;
  canonical.search = url.search;
  return Response.redirect(canonical.toString(), MOVED_PERMANENTLY);
};
