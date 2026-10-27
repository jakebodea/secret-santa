import { describe, expect, it } from "vitest";

import { site } from "./config.ts";
import { secretSource } from "./secrets.ts";
import {
  developmentStage,
  productionDeployRefusal,
  resolveStage,
} from "./stage.ts";

describe(resolveStage, () => {
  it("serves prod from the custom domain", () => {
    expect(resolveStage(site, "prod")).toStrictEqual({
      domain: "supersimplesecretsanta.com",
      kind: "production",
      origin: "https://supersimplesecretsanta.com",
      production: true,
      stage: "prod",
      workerName: "secret-santa-prod",
    });
  });

  it("serves previews from workers.dev", () => {
    expect(resolveStage(site, "pr-12").origin).toBe(
      "https://secret-santa-pr-12.jakebodea.workers.dev"
    );
  });

  it("rejects names Cloudflare can't use", () => {
    expect(() => resolveStage(site, "Feature/X")).toThrow("Invalid stage");
  });
});

describe(developmentStage, () => {
  it("slugs the worktree directory", () => {
    expect(developmentStage("t3-3db53da3")).toBe("dev-t3-3db53da3");
    expect(developmentStage("My Branch!!")).toBe("dev-my-branch");
  });
});

describe(productionDeployRefusal, () => {
  const prod = resolveStage(site, "prod");

  it("refuses prod outside CI and allows it in CI", () => {
    expect(productionDeployRefusal(prod, {})).toContain("Refusing");
    expect(productionDeployRefusal(prod, { CI: "true" })).toBeUndefined();
  });
});

describe(secretSource, () => {
  it("maps stages to Infisical tiers", () => {
    expect(secretSource("prod", true)).toStrictEqual({
      environment: "prod",
      project: "322067cc-5154-448d-af30-1d3f5e3ef5c4",
    });
    expect(secretSource("dev-x", false)).toStrictEqual({
      environment: "dev",
      project: "15cf2fcb-2af6-449b-ad28-4d3dc9033493",
    });
    expect(secretSource("pr-3", false)).toBeUndefined();
    expect(secretSource("dev-x", true)).toBeUndefined();
  });
});
