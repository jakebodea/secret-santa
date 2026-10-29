/**
 * A ready-made exchange in a link: `/assign#setup=<percent-encoded JSON>`.
 * The JSON is the `configure_exchange` input, so chatbots that can't run the
 * page can still hand people a filled-in draft. The fragment never reaches
 * the server.
 */
import { parseExchange } from "./webmcp/tools";

const SETUP_PREFIX = "#setup=";

export type SetupLinkResult =
  | { draft: ReturnType<typeof parseExchange> }
  | { error: string };

export function setupUrl(origin: string, input: Record<string, unknown>) {
  return `${origin}/assign${SETUP_PREFIX}${encodeURIComponent(JSON.stringify(input))}`;
}

/** Returns null when the hash carries no setup. */
export function readSetupLink(hash: string): SetupLinkResult | null {
  if (!hash.startsWith(SETUP_PREFIX)) {
    return null;
  }
  let input: unknown;
  try {
    input = JSON.parse(decodeURIComponent(hash.slice(SETUP_PREFIX.length)));
  } catch {
    return {
      error: "This setup link is damaged. Check that it was copied in full.",
    };
  }
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { error: "This setup link is not a valid exchange." };
  }
  try {
    return { draft: parseExchange(input as Record<string, unknown>) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
