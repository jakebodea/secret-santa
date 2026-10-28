import { useEffect, useLayoutEffect, useRef } from "react";

import type { ModelContext, WebMCPTool } from "../lib/webmcp/tools";

/** No shim: unsupported browsers retain the normal manual flow. */
export function useWebMCPTools(tools: WebMCPTool[]) {
  const latest = useRef(tools);
  useLayoutEffect(() => {
    latest.current = tools;
  });
  const names = tools.map((tool) => tool.name).join(",");
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context) {
      return;
    }
    const controller = new AbortController();
    const register = async () => {
      try {
        await Promise.all(
          names.split(",").map(async (name) => {
            const tool = latest.current.find((item) => item.name === name);
            if (!tool) {
              return;
            }
            if (controller.signal.aborted) {
              return;
            }
            await context.registerTool(
              {
                ...tool,
                execute: async (input) => {
                  try {
                    const current = latest.current.find(
                      (item) => item.name === tool.name
                    );
                    if (!current) {
                      return { error: "Tool is no longer available." };
                    }
                    return await current.execute(input);
                  } catch (error) {
                    return {
                      error:
                        error instanceof Error
                          ? error.message
                          : "Tool failed. Try the manual flow.",
                    };
                  }
                },
              },
              { signal: controller.signal }
            );
          })
        );
      } catch {
        // Experimental browser APIs must not prevent the manual flow from working.
        controller.abort();
      }
    };
    void register();
    return () => {
      controller.abort();
    };
  }, [names]);
}
