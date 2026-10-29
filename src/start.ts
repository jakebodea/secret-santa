import { createMiddleware, createStart } from "@tanstack/react-start";

import llms from "../public/llms.txt?raw";
import { wantsAgentMarkdown } from "./lib/agent-markdown";

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
  requestMiddleware: [agentMarkdown],
}));
