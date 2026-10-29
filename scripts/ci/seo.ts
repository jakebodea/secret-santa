import { SITE_URL } from "../../src/lib/seo.ts";
/**
 * Technical SEO audit of a running stage, reading server-rendered HTML the
 * way a crawler does:
 *
 *   bun scripts/ci/seo.ts <stage>                    # a deployed stage
 *   bun scripts/ci/seo.ts --url http://localhost:N   # `bun run dev`
 *
 * Audits every sitemap page (rules in `seo-audit.ts`), and checks robots.txt
 * points at the sitemap. Findings exit 1.
 */
import { site } from "../../stacks/config.ts";
import { resolveStage } from "../../stacks/stage.ts";
import { auditSite } from "./seo-audit.ts";
import type { Finding, Page } from "./seo-audit.ts";

const LOC = /<loc>(?<url>[^<]+)<\/loc>/gu;
const TIMEOUT_MS = 10_000;

const [first, second] = process.argv.slice(2);
const origin =
  first === "--url" ? second : first && resolveStage(site, first).origin;
if (origin === undefined) {
  process.stderr.write(
    "Usage: bun scripts/ci/seo.ts <stage> | --url <origin>\n"
  );
  process.exit(2);
}

const get = async (path: string) => {
  const response = await fetch(new URL(path, origin), {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { body: await response.text(), response };
};

const findings: Finding[] = [];

const robots = await get("/robots.txt");
if (!robots.body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
  findings.push({
    detail: "doesn't point at the sitemap",
    path: "/robots.txt",
    rule: "robots-txt",
  });
}
if (/^Disallow:\s*\/\s*$/mu.test(robots.body)) {
  findings.push({
    detail: "blocks the whole site",
    path: "/robots.txt",
    rule: "robots-txt",
  });
}

const sitemap = await get("/sitemap.xml");
const paths = [...sitemap.body.matchAll(LOC)].map(
  (match) => new URL(match.groups?.url ?? "/").pathname
);
if (paths.length === 0) {
  findings.push({
    detail: "no <loc> entries",
    path: "/sitemap.xml",
    rule: "sitemap",
  });
}

const pages: Page[] = [];
for (const path of paths) {
  // oxlint-disable-next-line no-await-in-loop -- a handful of pages; keep the stage unloaded
  const { body, response } = await get(path);
  const html =
    response.headers.get("content-type")?.includes("text/html") ?? false;
  if (response.status !== 200 || !html) {
    findings.push({
      detail: `answered ${response.status} ${response.headers.get("content-type")}`,
      path,
      rule: "sitemap",
    });
    continue;
  }
  pages.push({ html: body, path });
}
findings.push(...auditSite(pages, SITE_URL));

process.stdout.write(`SEO audit of ${origin}: ${pages.length} pages\n`);
for (const finding of findings) {
  process.stdout.write(
    `✗ ${finding.path} ${finding.rule}: ${finding.detail}\n`
  );
}
if (findings.length > 0) {
  process.exit(1);
}
process.stdout.write("✓ no findings\n");
