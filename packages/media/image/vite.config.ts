import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReynardImage",
      fileName: format => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "solid-js",
        "reynard-core",
        "reynard-components-core",
        "reynard-components-charts",
        "reynard-components-dashboard",
        "reynard-components-themes",
        "reynard-components-utils",
        "reynard-file-processing",
        "reynard-i18n",
      ],
    },
    target: "esnext",
    sourcemap: true,
  },
});
