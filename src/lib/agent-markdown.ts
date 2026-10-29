/**
 * Chat assistants read the home page but rarely follow links to /llms.txt,
 * so the home page answers them with it directly. People and search engines
 * get the normal page.
 */

// Fetchers that act for a person in a chat, or index for AI answers.
// Training crawlers (GPTBot, ClaudeBot) are blocked at the zone.
const AI_FETCHER =
  /ChatGPT-User|OAI-SearchBot|Claude-User|Claude-SearchBot|Perplexity-User|PerplexityBot/u;

export function wantsAgentMarkdown(request: Request): boolean {
  if (request.method !== "GET" || new URL(request.url).pathname !== "/") {
    return false;
  }
  const accept = request.headers.get("accept") ?? "";
  return (
    accept.includes("text/markdown") ||
    AI_FETCHER.test(request.headers.get("user-agent") ?? "")
  );
}
