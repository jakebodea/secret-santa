/**
 * Facts the stacks are built from. Not secrets: account ids, zone names and
 * hostnames are visible to anyone who can resolve DNS.
 */

/** Jake's Cloudflare account (same as the `sites` and `jbolabs` repos). */
export const accountId = "984b82870acd18daf8bda97bad966b38";

/** This repository on GitHub; `stacks/github.ts` writes CI credentials into it. */
export const repository = {
  owner: "jbolabs",
  repository: "secret-santa",
} as const;

/**
 * CI deploy tokens are minted per generation. Bump `generation` to rotate: the
 * next `stacks/github.ts` deploy mints fresh tokens, writes them to GitHub, and
 * deletes the previous generation. Rotate before `expiresOn`.
 */
export const deployTokens = {
  expiresOn: "2027-10-27T23:59:59Z",
  generation: 1,
} as const;

export const site = {
  /**
   * Attached to the production Worker only. The zone is on the account, so
   * prod sends from it too (Cloudflare Email Sending on the apex).
   */
  domain: "supersimplesecretsanta.com",
  /** Prefixes Worker names (`secret-santa-<stage>`) and names the stack. Never rename. */
  id: "secret-santa",
  /** The account's workers.dev subdomain, which non-prod stages are served from. */
  workersSubdomain: "jakebodea",
} as const;

/** The `supersimplesecretsanta.com` zone, pinned so the plan never has to look it up. */
export const zoneId = "1969c904b2a55ba169abc67ce97a4c9a";

/**
 * Who assignment mail comes from. Prod sends from the site's own domain;
 * deployed previews send from the studio's verified sending subdomain
 * (`jbolabs/stacks/studio.ts`), so a PR stage never needs its own DNS.
 * `alchemy dev` writes mail to `.alchemy/local/email` instead of sending.
 */
export const mail = {
  fromName: "Secret Santa",
  preview: "secret-santa@mail.jbolabs.com",
  production: "noreply@supersimplesecretsanta.com",
} as const;
