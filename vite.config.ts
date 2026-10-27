import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// No Cloudflare plugin: `Cloudflare.Website.Vite` in alchemy.run.ts injects it.
const config = defineConfig({
  build: {
    // Workers runtime modules. The injected Cloudflare plugin already treats them as
    // external; this lets `bun run build` (CI, no credentials) compile without it.
    rolldownOptions: { external: [/^cloudflare:/u] },
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
  resolve: {
    tsconfigPaths: true,
  },
});

export default config;
