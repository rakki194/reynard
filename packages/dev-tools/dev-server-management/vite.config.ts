import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "src/cli/index.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        "node:fs",
        "node:fs/promises",
        "node:path",
        "node:process",
        "node:child_process",
        "node:os",
        "node:net",
        "node:util",
        "node:events",
        "node:fetch",
        "commander",
        "chalk",
        "ora",
        "inquirer",
        "node-pty",
        "ws",
        "zod",
        "reynard-service-manager",
        "reynard-queue-watcher",
        "reynard-core",
      ],
    },
    target: "node18",
    minify: false,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.spec.ts", "**/*.d.ts"],
    },
  },
});
