import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardCharts",
      fileName: (format) => (format === "es" ? "index.js" : `index.${format}`),
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "@reynard/core",
        "chart.js",
        "solid-chartjs",
        "chartjs-adapter-date-fns",
      ],
      output: {
        globals: {
          "solid-js": "solid",
          "solid-js/web": "solidWeb",
          "@reynard/core": "ReynardCore",
          "chart.js": "Chart",
          "solid-chartjs": "SolidChartJS",
          "chartjs-adapter-date-fns": "ChartJSAdapterDateFns",
        },
      },
    },
    target: "esnext",
    sourcemap: true,
  },
});
