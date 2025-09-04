import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001,
    proxy: {
      "/api/assistant": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/api/chat": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@reynard/components": new URL(
        "../../packages/components/src",
        import.meta.url,
      ).pathname,
    },
  },
});
