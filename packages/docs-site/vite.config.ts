import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import path from "path";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: [
      {
        find: /^reynard-docs-components\/styles$/,
        replacement: path.resolve(
          __dirname,
          "../docs-components/dist/index.css",
        ),
      },
      {
        find: "reynard-docs-components",
        replacement: path.resolve(
          __dirname,
          "../docs-components/dist/index.js",
        ),
      },
      {
        find: "reynard-docs-core",
        replacement: path.resolve(__dirname, "../docs-core/dist/index.js"),
      },
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      external: ["solid-js", "solid-router"],
      output: {
        manualChunks: {
          "solid-router": ["@solidjs/router"],
          "reynard-core": ["reynard-core"],
          "reynard-components": ["reynard-components"],
          "reynard-themes": ["reynard-themes"],
          "reynard-docs-core": ["reynard-docs-core"],
          "reynard-docs-components": ["reynard-docs-components"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["reynard-docs-components", "reynard-docs-core"],
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["src/test-setup.ts"],
  },
});
