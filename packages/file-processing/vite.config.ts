import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardFileProcessing",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["solid-js", "@reynard/core", "@reynard/utils"],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "@reynard/core": "ReynardCore",
          "@reynard/utils": "ReynardUtils",
        },
      },
    },
  },
});
