import { resolve } from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReynardDashboard",
            fileName: format => (format === "es" ? "index.js" : `index.${format}`),
        },
        rollupOptions: {
            external: [
                "solid-js",
                "solid-js/web",
                "reynard-core",
                "reynard-colors",
                "reynard-themes",
                "reynard-fluent-icons",
                "reynard-charts",
                "reynard-components",
                "chart.js",
                "solid-chartjs",
                "chartjs-adapter-date-fns",
                "three",
            ],
            output: {
                globals: {
                    "solid-js": "solid",
                    "solid-js/web": "solidWeb",
                    "reynard-core": "ReynardCore",
                    "reynard-colors": "ReynardColors",
                    "reynard-themes": "ReynardThemes",
                    "reynard-fluent-icons": "ReynardFluentIcons",
                    "reynard-charts": "ReynardCharts",
                    "reynard-components-core": "ReynardComponentsCore",
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
