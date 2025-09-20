import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReynardComponentsUtils",
      fileName: format => `index.${format === "es" ? "js" : format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web"],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "solid-js/web": "SolidJSWeb",
        },
      },
    },
  },
  resolve: {
    alias: {
      "reynard-components-core": new URL("../components-core/src", import.meta.url).pathname,
      "reynard-core": new URL("../core/src", import.meta.url).pathname,
      "reynard-colors": new URL("../colors/src", import.meta.url).pathname,
    },
  },
});
