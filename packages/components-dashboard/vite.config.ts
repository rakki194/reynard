import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "solid-js/store",
        "reynard-components-core",
        "reynard-components-core/primitives",
        "reynard-components-core/navigation",
        "reynard-components-charts",
        "reynard-components-themes",
        "reynard-fluent-icons",
        "reynard-composables",
        "reynard-core",
        "reynard-charts",
        "reynard-themes",
      ],
    },
  },
});
