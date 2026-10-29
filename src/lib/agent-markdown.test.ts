import { describe, expect, it } from "vitest";

import { wantsAgentMarkdown } from "./agent-markdown";

const CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36";

function get(path: string, headers: Record<string, string>) {
  return new Request(`https://example.com${path}`, { headers });
}

describe(wantsAgentMarkdown, () => {
  it("answers chat assistants on the home page", () => {
    expect(
      wantsAgentMarkdown(
        get("/", {
          "user-agent":
            "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
        })
      )
    ).toBeTruthy();
    expect(
      wantsAgentMarkdown(get("/", { "user-agent": "Claude-User/1.0" }))
    ).toBeTruthy();
  });

  it("answers anything that asks for markdown", () => {
    expect(
      wantsAgentMarkdown(
        get("/", { accept: "text/markdown, text/html;q=0.8", "user-agent": "" })
      )
    ).toBeTruthy();
  });

  it("leaves browsers, search engines and other pages alone", () => {
    expect(
      wantsAgentMarkdown(
        get("/", { accept: "text/html", "user-agent": CHROME })
      )
    ).toBeFalsy();
    expect(
      wantsAgentMarkdown(
        get("/", {
          "user-agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        })
      )
    ).toBeFalsy();
    expect(
      wantsAgentMarkdown(get("/assign", { "user-agent": "ChatGPT-User/1.0" }))
    ).toBeFalsy();
  });
});
