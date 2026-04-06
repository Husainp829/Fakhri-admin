/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  // CRA-style JSX in `.js`: Vite's default esbuild step excludes `*.js`. Use `tsx` loader so `.tsx` and
  // plain `.ts` stay valid alongside `.js` with JSX.
  esbuild: {
    jsx: "automatic",
    loader: "tsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
      loader: {
        ".js": "jsx",
      },
    },
  },
  publicDir: "public",
  build: {
    outDir: "build",
    sourcemap: true,
    // TODO(post-migration): Revisit lru-cache usage in auth (see `authProvider.js`). v11 pulls top-level
    // await + `node:diagnostics_channel` (Vite externalizes the latter for the browser). Options: pin
    // lru-cache@10, replace with a lighter cache, or keep `target: "es2022"` and accept current behavior.
    target: "es2022",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    passWithNoTests: true,
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
  },
});
