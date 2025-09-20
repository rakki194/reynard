import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "src/cli.ts"),
        "queue-manager": resolve(__dirname, "src/queue-manager.ts"),
        processors: resolve(__dirname, "src/processors.ts"),
        config: resolve(__dirname, "src/config.ts"),
        "file-utils": resolve(__dirname, "src/file-utils.ts"),
        watcher: resolve(__dirname, "src/watcher.ts"),
        "queue-watcher": resolve(__dirname, "src/queue-watcher.ts"),
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
        exports: "named",
        globals: {
          chokidar: "chokidar",
          fs: "fs",
          path: "path",
          events: "events",
          child_process: "child_process",
          commander: "commander",
        },
        // Ensure CLI has proper shebang
        banner: chunk => {
          if (chunk.name === "cli") {
            return "#!/usr/bin/env node";
          }
          return "";
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
    setupFiles: ["../../vitest.global.config.ts"],
  },
});
