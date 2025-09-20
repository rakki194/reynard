import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardCaption",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["solid-js", "reynard-core", "reynard-components", "reynard-fluent-icons"],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "reynard-core": "ReynardCore",
          "reynard-components-core": "ReynardComponentsCore",
          "reynard-fluent-icons": "ReynardFluentIcons",
        },
      },
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
