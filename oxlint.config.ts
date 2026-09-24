import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";
import vitest from "ultracite/oxlint/vitest";

// eslint-plugin-github and eslint-plugin-sonarjs load typescript-eslint, which
// does not support TS 7 yet — re-enable when those plugins support Project Corsa.
const jsPlugins = selectJsPlugins(["react-doctor"]);

export default defineConfig({
  extends: [
    core,
    react,
    tanstack,
    vitest,
    tanstackJsPlugins,
    shadcn,
    jsPlugins,
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "src/routeTree.gen.ts",
    // React Email templates are not part of the Tailwind/shadcn UI surface.
    "src/emails/**",
  ],
  jsPlugins: [...(jsPlugins.jsPlugins ?? []), ...(shadcn.jsPlugins ?? [])],
  settings: {
    ...jsPluginSettings,
    shadcn: {
      ui: "@/components/ui",
    },
  },
  overrides: [
    {
      files: ["src/routes/**"],
      rules: {
        // Route modules export Route config alongside page components.
        "react-doctor/only-export-components": "off",
      },
    },
  ],
  rules: {
    "eslint/require-await": "off",
    "func-style": "off",
    "no-use-before-define": ["error", { functions: false }],
    "react/function-component-definition": "off",
    "react/todo": "off",
  },
});
