import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: "esnext",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "@reynard/core": new URL("../../packages/core/src", import.meta.url)
        .pathname,
    },
  },
});
