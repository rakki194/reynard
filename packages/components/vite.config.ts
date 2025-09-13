import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardComponents",
      fileName: (format) => {
        if (format === "es") return "index.js";
        if (format === "cjs") return "index.cjs";
        return `index.${format}`;
      },
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "reynard-core",
        "reynard-colors",
        "reynard-fluent-icons",
        "reynard-themes",
        "reynard-charts",
        "three",
      ],
      output: {
        globals: {
          "solid-js": "solid",
          "solid-js/web": "solidWeb",
          "reynard-core": "ReynardCore",
          "reynard-colors": "ReynardColors",
          "reynard-fluent-icons": "ReynardFluentIcons",
          "reynard-themes": "ReynardThemes",
          "reynard-charts": "ReynardCharts",
          three: "THREE",
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
