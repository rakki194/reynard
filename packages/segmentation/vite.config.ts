import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardSegmentation",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "solid-js/store",
        "reynard-ai-shared",
        "reynard-algorithms", 
        "reynard-annotating-core",
        "reynard-floating-panel",
        "reynard-caption",
        "reynard-boundingbox",
      ],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "solid-js/web": "SolidJSWeb",
          "solid-js/store": "SolidJSStore",
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});






