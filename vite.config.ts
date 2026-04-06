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
      loader: {
        ".js": "jsx",
      },
    },
  },
  publicDir: "public",
  build: {
    outDir: "build",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
