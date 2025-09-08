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
      "reynard-core": new URL("../../packages/core/src", import.meta.url).pathname,
      "reynard-components": new URL("../../packages/components/src", import.meta.url).pathname,
      "reynard-themes": new URL("../../packages/themes/src", import.meta.url).pathname,
      "reynard-charts": new URL("../../packages/charts/src", import.meta.url).pathname,
      "reynard-fluent-icons": new URL("../../packages/fluent-icons/src", import.meta.url).pathname,
    },
  },
});
