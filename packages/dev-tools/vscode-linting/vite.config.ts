import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/extension.ts"),
      name: "ReynardVSCodeLinting",
      formats: ["cjs"],
      fileName: () => "extension.js",
    },
    rollupOptions: {
      external: [
        "vscode",
        "vscode-languageclient",
        "vscode-languageserver",
        "vscode-languageserver-textdocument",
        "reynard-incremental-linting",
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
      output: {
        format: "cjs",
        exports: "named",
      },
    },
    target: "node18",
    minify: false,
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
