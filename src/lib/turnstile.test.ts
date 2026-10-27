import { describe, expect, it } from "vitest";

import { verifyTurnstile } from "./turnstile";

const siteverify = (reply: object) => {
  const calls: { url: string; body: string }[] = [];
  const fake = (async (url: string, init?: RequestInit) => {
    calls.push({ body: String(init?.body), url });
    return Response.json(reply);
  }) as typeof fetch;
  return { calls, fake };
};

describe(verifyTurnstile, () => {
  it("passes the token, secret and IP to siteverify and accepts success", async () => {
    const { calls, fake } = siteverify({ success: true });
    const result = await verifyTurnstile({
      fetch: fake,
      remoteIp: "203.0.113.7",
      secret: "s3cret",
      token: "tok",
    });
    expect(result).toStrictEqual({ ok: true });
    expect(calls).toStrictEqual([
      {
        body: "response=tok&secret=s3cret&remoteip=203.0.113.7",
        url: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      },
    ]);
  });

  it("reports Cloudflare's error codes on failure", async () => {
    const { fake } = siteverify({
      "error-codes": ["timeout-or-duplicate"],
      success: false,
    });
    const result = await verifyTurnstile({
      fetch: fake,
      remoteIp: null,
      secret: "s3cret",
      token: "reused",
    });
    expect(result).toStrictEqual({
      codes: ["timeout-or-duplicate"],
      ok: false,
    });
  });

  it("rejects a missing token without calling Cloudflare", async () => {
    const { calls, fake } = siteverify({ success: true });
    const result = await verifyTurnstile({
      fetch: fake,
      remoteIp: null,
      secret: "s3cret",
      token: "",
    });
    expect(result).toStrictEqual({
      codes: ["missing-input-response"],
      ok: false,
    });
    expect(calls).toHaveLength(0);
  });
});
