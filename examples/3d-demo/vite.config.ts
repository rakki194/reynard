import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3003,
    host: true,
  },
  build: {
    target: "esnext",
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["three"]
  }
});
