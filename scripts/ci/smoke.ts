/**
 * Post-deploy smoke test for a deployed stage, without sending any mail:
 *
 *   bun scripts/ci/smoke.ts <stage>
 *
 * Pages answer 200, and the send endpoint refuses a request with no
 * Turnstile token (403), which proves the guard is live. On prod, `www`
 * answers 301 to the apex (`src/lib/canonical-redirect.ts`). Retries while a
 * fresh custom domain or workers.dev route is still propagating.
 */
import { site } from "../../stacks/config.ts";
import { resolveStage } from "../../stacks/stage.ts";

const ATTEMPTS = 30;
const DELAY_MS = 5000;

const stage = process.argv.at(2);
if (stage === undefined) {
  process.stderr.write("Usage: bun scripts/ci/smoke.ts <stage>\n");
  process.exit(2);
}
const { origin, production } = resolveStage(site, stage);
const wwwOrigin = origin.replace("https://", "https://www.");

interface Check {
  path: string;
  init?: RequestInit;
  status: number;
  /** Another origin than the stage's, e.g. prod's `www` alias. */
  origin?: string;
}

const checks: Check[] = [
  { path: "/", status: 200 },
  { path: "/assign", status: 200 },
  { path: "/support", status: 200 },
  {
    init: {
      body: JSON.stringify({ assignments: [], players: [] }),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
    path: "/api/send-emails",
    status: 403,
  },
  ...(production
    ? [
        {
          init: { redirect: "manual" } as const,
          origin: wwwOrigin,
          path: "/support",
          status: 301,
        },
      ]
    : []),
];

const statusOf = async ({ path, init, origin: base = origin }: Check) => {
  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      signal: AbortSignal.timeout(DELAY_MS),
    });
    return response.status;
  } catch {
    return 0;
  }
};

process.stdout.write(`Smoke testing ${origin}\n`);
for (const check of checks) {
  let status = 0;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    // oxlint-disable-next-line no-await-in-loop -- retries must wait for each other
    status = await statusOf(check);
    if (status === check.status) {
      break;
    }
    // oxlint-disable-next-line no-await-in-loop -- backoff between retries
    await Bun.sleep(DELAY_MS);
  }
  const verb = check.init?.method ?? "GET";
  process.stdout.write(
    `${verb} ${check.origin ?? ""}${check.path} → ${status}\n`
  );
  if (status !== check.status) {
    process.stderr.write(`expected ${check.status}\n`);
    process.exit(1);
  }
}
