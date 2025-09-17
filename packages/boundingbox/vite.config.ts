import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardBoundingBox",
      fileName: "index",
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: ["solid-js", "fabric"],
      output: {
        globals: {
          "solid-js": "SolidJS",
          fabric: "fabric",
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
});
