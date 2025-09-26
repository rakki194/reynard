import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "primitives/index": "src/primitives/index.ts",
      },
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
    },
  },
});
