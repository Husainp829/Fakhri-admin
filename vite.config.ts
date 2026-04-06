import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  // CRA-style JSX in `.js`: treat app sources under `src` as TS/TSX-capable, and prebundle deps whose
  // `.js` files contain JSX (Vite 8 uses Oxc + Rolldown instead of esbuild).
  oxc: {
    include: /src\/.*\.[jt]sx?$/,
    jsx: { runtime: "automatic" },
  },
  optimizeDeps: {
    rolldownOptions: {
      moduleTypes: {
        ".js": "jsx",
      },
    },
  },
  publicDir: "public",
  build: {
    outDir: "build",
    sourcemap: true,
    // TODO(post-migration): Revisit lru-cache usage in auth (see `auth-provider.ts`). v11 pulls top-level
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
