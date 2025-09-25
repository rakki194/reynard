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
        "solid-js/h",
        "solid-js/jsx-runtime",
        "solid-js/jsx-dev-runtime",
        /^reynard-/,
      ],
      output: {
        globals: {
          "solid-js": "Solid",
          "solid-js/web": "SolidWeb",
          "solid-js/store": "SolidStore",
        },
      },
    },
    target: "esnext",
    minify: false,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["../../vitest.global.config.ts"],
  },
});
