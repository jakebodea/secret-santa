import { createMiddleware, createStart } from "@tanstack/react-start";

import llms from "../public/llms.txt?raw";
import { env } from "./env";
import { wantsAgentMarkdown } from "./lib/agent-markdown";
import { canonicalRedirect } from "./lib/canonical-redirect";

// `www` and plain HTTP 301 to the apex before anything renders.
const canonicalHost = createMiddleware().server(
  ({ request, next }) => canonicalRedirect(request, env.SITE_ORIGIN) ?? next()
);

const agentMarkdown = createMiddleware().server(({ request, next }) => {
  if (!wantsAgentMarkdown(request)) {
    return next();
  }
  return new Response(llms, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      vary: "Accept, User-Agent",
    },
  });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [canonicalHost, agentMarkdown],
}));
