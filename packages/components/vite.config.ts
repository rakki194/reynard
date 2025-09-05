import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardComponents",
      fileName: (format) => (format === "es" ? "index.js" : `index.${format}`),
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "@reynard/core"],
      output: {
        globals: {
          "solid-js": "solid",
          "solid-js/web": "solidWeb",
          "@reynard/core": "ReynardCore",
        },
        assetFileNames: (assetInfo) => {
          const assetName = (assetInfo as { fileName?: string }).fileName;
          if (assetName === "style.css") {
            return "styles.css";
          }
          if (assetName === "components.css") {
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
