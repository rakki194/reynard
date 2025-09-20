import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardModelManagement",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["solid-js", "reynard-core", "reynard-service-manager"],
      output: {
        exports: "named",
        globals: {
          "solid-js": "SolidJS",
          "reynard-core": "ReynardCore",
          "reynard-service-manager": "ReynardServiceManager",
        },
      },
    },
    target: "node18",
    minify: false,
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["../../vitest.global.config.ts", "./src/test-setup.ts"],
  },
});
