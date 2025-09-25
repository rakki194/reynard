import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "src/cli.ts"),
        "linting-service": resolve(__dirname, "src/linting-service.ts"),
        "queue-manager": resolve(__dirname, "src/queue-manager.ts"),
        processors: resolve(__dirname, "src/processors.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "chokidar",
        "commander",
        "reynard-queue-watcher",
        "reynard-dev-tools-catalyst",
        "reynard-project-architecture",
        // Node.js built-in modules
        "events",
        "child_process",
        "fs/promises",
        "fs",
        "path",
        "os",
        "util",
        "crypto",
        "stream",
        "buffer",
        "url",
        "querystring",
        "http",
        "https",
        "net",
        "tls",
        "zlib",
        "readline",
        "cluster",
        "worker_threads",
      ],
    },
    target: "node18",
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
