import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: process.env.E2E_BACKEND_URL || "http://localhost:8888",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
