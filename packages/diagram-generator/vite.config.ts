import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "node18",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardDiagramGenerator",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "solid-js",
        "reynard-core",
        "reynard-service-manager",
        "reynard-queue-watcher",
        "fs/promises",
        "path",
        "fs",
        "os",
        "util",
        "child_process",
        "crypto",
        "stream",
        "events",
        "url",
        "querystring",
        "http",
        "https",
        "zlib",
        "buffer",
        "process",
      ],
    },
  },
});
