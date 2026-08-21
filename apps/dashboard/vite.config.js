import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(here, "src"),
      // Le package partage est consomme en source (pas de build intermediaire).
      "@yaammoo/shared": path.resolve(here, "../../packages/shared/src"),
    },
  },
  server: { port: 5174 },
});
