import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Minimal Vitest config — full app Vite plugins break Vitest 5 on Vite 8. */
export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    passWithNoTests: true,
  },
});
