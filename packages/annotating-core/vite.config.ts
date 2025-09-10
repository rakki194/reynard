import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReynardAnnotatingCore",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "solid-js", 
        "solid-js/web", 
        "solid-js/store",
        "reynard-ai-shared",
        "reynard-core",
        "reynard-service-manager"
      ],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "solid-js/web": "SolidJSWeb",
          "solid-js/store": "SolidJSStore",
          "reynard-ai-shared": "ReynardAIShared",
          "reynard-core": "ReynardCore",
          "reynard-service-manager": "ReynardServiceManager",
        },
      },
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
