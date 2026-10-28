import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { WebMCPTool } from "../lib/webmcp/tools";
import { ResultsDisplay } from "./results-display";

vi.mock(import("./turnstile-widget"), () => ({
  TurnstileWidget: ({ onToken }: { onToken: (token: string) => void }) => (
    <button type="button" onClick={() => onToken("verified-token")}>
      Verify test
    </button>
  ),
}));

const players = ["Alice", "Bob", "Cara"].map((name) => ({
  id: name,
  name,
  email: `${name}@example.com`,
  isAdmin: name === "Alice",
}));
const assignments = [
  { giverId: "Alice", receiverId: "Bob" },
  { giverId: "Bob", receiverId: "Cara" },
  { giverId: "Cara", receiverId: "Alice" },
];

function setup() {
  const registry = new Map<string, WebMCPTool>();
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool: (tool: WebMCPTool, { signal }: { signal: AbortSignal }) => {
        registry.set(tool.name, tool);
        signal.addEventListener("abort", () => registry.delete(tool.name));
      },
    },
  });
  render(
    <ResultsDisplay
      players={players}
      assignments={assignments}
      turnstileSiteKey="test"
      onRedraw={() => {}}
      onStartOver={() => {}}
    />
  );
  return registry;
}

describe("WebMCP email delivery", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    Reflect.deleteProperty(document, "modelContext");
    vi.unstubAllGlobals();
  });

  test("requires approval and verification without making a request", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const tools = setup();
    const send = tools.get("send_assignment_emails");
    expect(send?.annotations).toHaveProperty("consequentialHint", true);
    await expect(send?.execute({})).resolves.toHaveProperty("error");
    await expect(send?.execute({ confirmed: true })).resolves.toHaveProperty(
      "error",
      "Complete verification in the page before sending."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("sends through the existing endpoint once and reports acceptance without matches", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const tools = setup();
    fireEvent.click(screen.getByRole("button", { name: "Verify test" }));
    await act(async () => {
      const send = tools.get("send_assignment_emails");
      const first = send?.execute({ confirmed: true });
      await expect(send?.execute({ confirmed: true })).resolves.toHaveProperty(
        "error"
      );
      await expect(first).resolves.toHaveProperty("status", "sent");
      await expect(send?.execute({ confirmed: true })).resolves.toHaveProperty(
        "error"
      );
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    await expect(
      tools.get("get_delivery_status")?.execute({})
    ).resolves.toMatchObject({ status: "sent" });
  });

  test("agent cannot bypass a cooldown", async () => {
    localStorage.setItem(
      "ss_email_cooldown_until",
      String(Date.now() + 60_000)
    );
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const tools = setup();
    fireEvent.click(screen.getByRole("button", { name: "Verify test" }));
    await act(async () => {
      await expect(
        tools
          .get("send_assignment_emails")
          ?.execute({ confirmed: true, bypass: true })
      ).resolves.toHaveProperty(
        "error",
        "Sending is on cooldown. Use the page to review resend options."
      );
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
