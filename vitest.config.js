import path from "node:path";
import { defineConfig } from "vitest/config";

// Deliberately separate from vite.config.js — that file's @base44/vite-plugin
// wires up dev-only concerns (HMR notifier, visual-edit agent, analytics)
// that have no place in a Node test run. Tests only need the same `@/`
// path alias the app code uses.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
