import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReynardDocsGenerator",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["typescript", "fs-extra", "gray-matter", "marked", "highlight.js", "glob", "chokidar"],
      output: {
        globals: {
          typescript: "ts",
          "fs-extra": "fs",
          "gray-matter": "matter",
          marked: "marked",
          "highlight.js": "hljs",
          glob: "glob",
          chokidar: "chokidar",
        },
      },
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
