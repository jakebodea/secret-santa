/**
 * Cloudflare Turnstile siteverify. `fetch` is passed in so tests fake the
 * network, not this module.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly codes: readonly string[] };

export const verifyTurnstile = async (input: {
  readonly token: string;
  readonly secret: string;
  /** The visitor's IP (`CF-Connecting-IP`), which strengthens the check. */
  readonly remoteIp: string | null;
  readonly fetch: typeof fetch;
}): Promise<TurnstileResult> => {
  if (input.token === "") {
    return { codes: ["missing-input-response"], ok: false };
  }
  const body = new URLSearchParams({
    response: input.token,
    secret: input.secret,
  });
  if (input.remoteIp !== null) {
    body.set("remoteip", input.remoteIp);
  }
  const response = await input.fetch(SITEVERIFY_URL, { body, method: "POST" });
  const result = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };
  return result.success === true
    ? { ok: true }
    : { codes: result["error-codes"] ?? [], ok: false };
};
