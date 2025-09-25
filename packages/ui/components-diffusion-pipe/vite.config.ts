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
        "reynard-components-core/layout",
        "reynard-components-core/icons",
        "reynard-fluent-icons",
        "reynard-charts",
        "reynard-diffusion-pipe",
        "reynard-connection",
        "reynard-core",
      ],
    },
  },
});
