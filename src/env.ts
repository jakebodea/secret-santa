/**
 * Worker bindings and vars, declared in `alchemy.run.ts`. Import `env` from
 * here (server code only) instead of reading `process.env`.
 */
declare global {
  // oxlint-disable-next-line typescript/no-namespace -- workers-types types `env` as the global `Cloudflare.Env`; augmenting it is the only way in
  namespace Cloudflare {
    interface Env {
      /** Cloudflare Email Service; `alchemy dev` writes mail to `.alchemy/local/email`. */
      EMAIL: SendEmail;
      /** The only address `EMAIL` may send from on this stage. */
      MAIL_FROM: string;
      MAIL_FROM_NAME: string;
      /** Public origin of this stage, e.g. `https://supersimplesecretsanta.com`. */
      SITE_ORIGIN: string;
      STAGE: string;
    }
  }
}

export { env } from "cloudflare:workers";
