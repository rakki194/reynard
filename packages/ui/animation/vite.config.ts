import { resolve } from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "core/index": resolve(__dirname, "src/core/index.ts"),
        "easing/index": resolve(__dirname, "src/easing/easing.ts"),
        "engines/index": resolve(__dirname, "src/engines/index.ts"),
        "composables/index": resolve(__dirname, "src/composables/index.ts"),
        "utils/index": resolve(__dirname, "src/utils/index.ts"),
      },
      name: "ReynardAnimation",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (format === "es") {
          return entryName === "index" ? "index.js" : `${entryName}.js`;
        }
        return entryName === "index" ? "index.cjs" : `${entryName}.cjs`;
      },
    },
    rollupOptions: {
      external: ["solid-js"],
      output: {
        globals: {
          "solid-js": "SolidJS",
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
