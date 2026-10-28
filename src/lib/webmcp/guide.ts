import markdown from "./guide.md?raw";
import { emptySchema } from "./tools";
import type { WebMCPTool } from "./tools";

export const exchangeGuideTool: WebMCPTool = {
  name: "get_exchange_guide",
  description:
    "Call this first when organizing a Secret Santa exchange. Returns a Markdown guide covering required details, organizer permissions, setup, exclusions, drawing, verification, sending, and completion. Read-only; available throughout the flow.",
  inputSchema: emptySchema,
  annotations: { readOnlyHint: true },
  execute: () => markdown,
};
