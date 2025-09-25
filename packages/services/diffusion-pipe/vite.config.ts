import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardDiffusionPipe",
      formats: ["es", "cjs"],
      fileName: format => `index.${format === "es" ? "js" : format}`,
    },
    rollupOptions: {
      external: ["solid-js", "reynard-http-client", "reynard-i18n", "reynard-connection", "reynard-core"],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "reynard-http-client": "ReynardHttpClient",
          "reynard-i18n": "ReynardI18n",
          "reynard-connection": "ReynardConnection",
          "reynard-core": "ReynardCore",
        },
      },
    },
    sourcemap: true,
    target: "esnext",
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
});
