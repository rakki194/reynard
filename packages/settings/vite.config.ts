import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardSettings",
      fileName: (format) => (format === "es" ? "index.js" : `index.${format}`),
    },
    rollupOptions: {
      external: [
        "solid-js", 
        "solid-js/web", 
        "@reynard/core", 
        "@reynard/components"
      ],
      output: {
        globals: {
          "solid-js": "solid",
          "solid-js/web": "solidWeb",
          "@reynard/core": "ReynardCore",
          "@reynard/components": "ReynardComponents",
        },
      },
    },
    target: "esnext",
    sourcemap: true,
  },
});




