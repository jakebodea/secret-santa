import { createServerFn } from "@tanstack/react-start";

/** The stage's public Turnstile site key, for the widget on the send step. */
export const getTurnstileSiteKey = createServerFn().handler(async () => {
  // Imported inside the handler so `cloudflare:workers` never reaches the client bundle.
  const { env } = await import("../env");
  return env.TURNSTILE_SITE_KEY;
});
