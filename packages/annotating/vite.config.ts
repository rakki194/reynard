import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReynardAnnotating",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "solid-js/store",
        "reynard-annotating-core",
        "reynard-annotating-jtp2",
        "reynard-annotating-joy",
        "reynard-annotating-florence2",
        "reynard-annotating-wdv3",
        "reynard-core",
        "reynard-service-manager",
      ],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "solid-js/web": "SolidJSWeb",
          "solid-js/store": "SolidJSStore",
          "reynard-annotating-core": "ReynardAnnotatingCore",
          "reynard-annotating-jtp2": "ReynardAnnotatingJTP2",
          "reynard-annotating-joy": "ReynardAnnotatingJoy",
          "reynard-annotating-florence2": "ReynardAnnotatingFlorence2",
          "reynard-annotating-wdv3": "ReynardAnnotatingWDv3",
          "reynard-core": "ReynardCore",
          "reynard-service-manager": "ReynardServiceManager",
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
