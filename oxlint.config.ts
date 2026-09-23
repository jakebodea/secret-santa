import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react],
  ignorePatterns: [...(core.ignorePatterns ?? []), "src/routeTree.gen.ts"],
  overrides: [
    {
      // Email templates are table-based HTML for mail clients, not interactive UI.
      files: ["src/emails/**"],
      rules: { "jsx-a11y/control-has-associated-label": "off" },
    },
  ],
  rules: {
    // TanStack file routes reference their component before its declaration
    // (`createFileRoute(...)({ component: Page })`), which only works with
    // hoisted function declarations.
    "func-style": "off",
    "no-use-before-define": ["error", { functions: false }],
    "react/function-component-definition": "off",
    // Flags React Compiler bailouts (e.g. try/finally), not code problems.
    "react/todo": "off",
  },
});
