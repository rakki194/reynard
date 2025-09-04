import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        styles: resolve(__dirname, "src/styles.css"),
      },
      name: "ReynardUI",
      fileName: (format) => (format === "es" ? "index.js" : `index.${format}`),
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "@reynard/core",
        "@reynard/components",
      ],
      output: {
        globals: {
          "solid-js": "solid",
          "solid-js/web": "solidWeb",
          "@reynard/core": "ReynardCore",
          "@reynard/components": "ReynardComponents",
        },
        assetFileNames: (assetInfo) => {
          const assetName = (assetInfo as { fileName?: string }).fileName;
          if (assetName === "style.css") {
            return "styles.css";
          }
          if (assetName === "ui.css") {
            return "styles.css";
          }
          return assetName || "asset";
        },
      },
    },
    target: "esnext",
    sourcemap: true,
    cssCodeSplit: false,
  },
});
