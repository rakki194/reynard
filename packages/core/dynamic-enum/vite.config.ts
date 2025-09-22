import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardDynamicEnum",
      fileName: "index",
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: ["solid-js"],
      output: {
        globals: {
          "solid-js": "SolidJS",
        },
      },
    },
    target: "es2020",
    sourcemap: true,
  },
  test: {
    environment: "happy-dom",
    globals: true,
  },
});
