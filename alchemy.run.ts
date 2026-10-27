/**
 * Super Simple Secret Santa: one Alchemy stack, one stage per environment.
 * Every Cloudflare resource and setting the app uses is declared here; there
 * is no wrangler config and no dashboard state.
 *
 *   all stages: the TanStack Start Worker, a Cloudflare Email binding, a per-IP
 *   rate limit and a Turnstile widget guarding /api/send-emails
 *   prod only: supersimplesecretsanta.com, Email Sending on the apex, DMARC
 *
 *   bun run dev                         # alchemy dev, stage dev-<worktree>
 *   bun alchemy deploy --stage pr-<n>   # a preview (CI does this for labelled PRs)
 *
 * Prod deploys from CI on merge to `main`; the stack refuses otherwise.
 */
import * as Alchemy from "alchemy";
import { AlchemyContext } from "alchemy/AlchemyContext";
import * as Cloudflare from "alchemy/Cloudflare";
import * as RemovalPolicy from "alchemy/RemovalPolicy";
import { localState } from "alchemy/State";
import { Effect, Layer } from "effect";

import { mail, site, zoneId } from "./stacks/config.ts";
import { stageSecrets } from "./stacks/secrets.ts";
import {
  devPort,
  productionDeployRefusal,
  resolveStage,
  stageKind,
} from "./stacks/stage.ts";

/**
 * `dev-*` stages under `alchemy dev` only have emulated resources, so their
 * state stays in the worktree's `.alchemy/state` (the remote store costs
 * seconds on every boot). Everything deployed uses the account's state store.
 */
const state = Layer.unwrap(
  Effect.gen(function* resolveState() {
    const stage = yield* Alchemy.Stage;
    const { dev } = yield* AlchemyContext;
    return dev && stageKind(stage) === "development"
      ? localState()
      : Cloudflare.state();
  })
);

/** Logs on everywhere; traces sampled on prod. */
const observability = (production: boolean) => ({
  enabled: true,
  logs: {
    enabled: true,
    headSamplingRate: 1,
    invocationLogs: true,
    persist: true,
  },
  traces: {
    enabled: true,
    headSamplingRate: production ? 0.1 : 1,
    persist: true,
  },
});

/**
 * Cloudflare's documented always-pass Turnstile test keys. Turnstile has no
 * local emulation, so `alchemy dev` uses these; deployed stages get a widget.
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
const TURNSTILE_TEST_KEYS = {
  secret: "1x0000000000000000000000000000000AA",
  sitekey: "1x00000000000000000000AA",
} as const;

/** Registers the apex for Cloudflare Email Sending and publishes a DMARC policy. */
const productionMail = Effect.gen(function* registerProductionMail() {
  yield* Cloudflare.Email.SendingSubdomain("Sending", {
    name: site.domain,
    // Assignment mail names who buys for whom: keep no copies in Cloudflare's activity log.
    previewEnabled: false,
    zoneId,
  }).pipe(RemovalPolicy.retain());
  yield* Cloudflare.DNS.Record("Dmarc", {
    // Monitor first; tighten to quarantine once reports show only Cloudflare sending.
    content: '"v=DMARC1; p=none; adkim=r; aspf=r"',
    name: `_dmarc.${site.domain}`,
    ttl: 1,
    type: "TXT",
    zoneId,
  });
});

export default Alchemy.Stack(
  site.id,
  {
    providers: Cloudflare.providers(),
    secrets: stageSecrets,
    state,
  },
  Effect.gen(function* stack() {
    const stage = resolveStage(site, yield* Alchemy.Stage);
    const refusal = productionDeployRefusal(stage, process.env);
    if (refusal !== undefined) {
      return yield* Effect.die(new Error(refusal));
    }
    const { dev } = yield* AlchemyContext;
    const port = devPort(stage.stage);
    const origin = dev ? `http://localhost:${port}` : stage.origin;

    if (stage.production) {
      yield* productionMail;
    }
    const mailFrom = stage.production ? mail.production : mail.preview;
    const turnstile = dev
      ? TURNSTILE_TEST_KEYS
      : yield* Cloudflare.Turnstile.Widget("Turnstile", {
          domains: [new URL(stage.origin).hostname],
          mode: "managed",
          name: stage.workerName,
        });

    const website = yield* Cloudflare.Website.Vite("Website", {
      compatibility: {
        date: "2026-09-01",
        flags: ["nodejs_compat"],
      },
      dev: { port, strictPort: true },
      domain: stage.domain,
      env: {
        // Under `alchemy dev` this writes each message to .alchemy/local/email.
        EMAIL: Cloudflare.Email.SendEmail("Email", {
          allowedSenderAddresses: [mailFrom],
        }),
        MAIL_FROM: mailFrom,
        MAIL_FROM_NAME: mail.fromName,
        // Two sends a minute per IP: enough to fix a typo and resend, not enough to spam.
        SEND_LIMIT: Cloudflare.RateLimit("SEND_LIMIT", {
          namespaceId: 1225,
          simple: { limit: 2, period: 60 },
        }),
        SITE_ORIGIN: origin,
        STAGE: stage.stage,
        TURNSTILE_SECRET_KEY: turnstile.secret,
        TURNSTILE_SITE_KEY: turnstile.sitekey,
      },
      name: stage.workerName,
      observability: observability(stage.production),
    });

    return {
      stage: stage.stage,
      url: website.url,
    };
  })
);
