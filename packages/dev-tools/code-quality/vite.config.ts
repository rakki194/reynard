import { resolve } from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "src/cli.ts"),
      },
      name: "ReynardCodeQuality",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : format}`,
    },
    rollupOptions: {
      external: [
        "solid-js", 
        "solid-js/web", 
        "chokidar", 
        "commander", 
        "fs/promises", 
        "fs", 
        "path", 
        "child_process", 
        "events", 
        "util",
        "reynard-core",
        "reynard-ui",
        "reynard-charts",
        "reynard-components-core",
        "reynard-components-charts",
        "reynard-components-dashboard",
        "reynard-components-themes",
        "reynard-components-utils",
        "reynard-fluent-icons"
      ],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "solid-js/web": "SolidJSWeb",
          chokidar: "chokidar",
          commander: "commander",
          "reynard-core": "ReynardCore",
          "reynard-ui": "ReynardUI",
          "reynard-charts": "ReynardCharts",
          "reynard-components-core": "ReynardComponentsCore",
          "reynard-components-charts": "ReynardComponentsCharts",
          "reynard-components-dashboard": "ReynardComponentsDashboard",
          "reynard-components-themes": "ReynardComponentsThemes",
          "reynard-components-utils": "ReynardComponentsUtils",
          "reynard-fluent-icons": "ReynardFluentIcons",
        },
        exports: "named"
      },
    },
    sourcemap: true,
    target: "esnext",
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
});
