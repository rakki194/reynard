import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "primitives/index": "src/primitives/index.ts",
        "navigation/index": "src/navigation/index.ts",
        "layout/index": "src/layout/index.ts",
        "icons/index": "src/icons/index.ts",
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store", "reynard-core", "reynard-fluent-icons"],
    },
  },
});
