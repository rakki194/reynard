import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardGallery",
      fileName: (format) => (format === "es" ? "index.js" : `index.${format}`),
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "@reynard/core",
        "@reynard/components",
        "@solid-primitives/intersection-observer",
        "@solid-primitives/resize-observer",
        "@solid-primitives/event-listener",
      ],
      output: {
        globals: {
          "solid-js": "solid",
          "solid-js/web": "solidWeb",
          "@reynard/core": "ReynardCore",
          "@reynard/components": "ReynardComponents",
          "@solid-primitives/intersection-observer":
            "SolidPrimitivesIntersectionObserver",
          "@solid-primitives/resize-observer": "SolidPrimitivesResizeObserver",
          "@solid-primitives/event-listener": "SolidPrimitivesEventListener",
        },
      },
    },
    target: "esnext",
    sourcemap: true,
  },
});
