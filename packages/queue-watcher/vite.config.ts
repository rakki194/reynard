import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "src/cli.ts"),
        "queue-manager": resolve(__dirname, "src/queue-manager.ts"),
        processors: resolve(__dirname, "src/processors.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "js" : "cjs";
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ["chokidar", "fs", "path", "events", "child_process", "commander"],
      output: {
        globals: {
          chokidar: "chokidar",
          fs: "fs",
          path: "path",
          events: "events",
          child_process: "child_process",
          commander: "commander",
        },
      },
    },
    target: "node18",
    minify: false,
    sourcemap: true,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["../../vitest.global.config.ts"],
  },
});
