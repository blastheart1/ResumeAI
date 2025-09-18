import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // ensures assets use relative paths (good for Vercel)
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), // maps @ -> src
    },
  },
  server: {
    host: true, // expose locally for network testing if needed
    port: 5173,
  },
  build: {
    outDir: "dist", // Vite default, just to be explicit
    sourcemap: true, // optional, helpful for debugging blank page issues
  },
});
