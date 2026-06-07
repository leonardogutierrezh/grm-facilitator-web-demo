import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BACKEND = "https://grm-web-app-benin.vercel.app";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local dev mirror of the Vercel rewrite: /api/* -> backend
      "/api": {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
