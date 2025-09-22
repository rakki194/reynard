import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "dependency-analyzer": resolve(__dirname, "src/dependency-analyzer.ts"),
        "simplified-diagram-generator": resolve(__dirname, "src/simplified-diagram-generator.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "js" : "cjs";
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ["fs", "path", "commander"],
      output: {
        exports: "named",
        globals: {
          fs: "fs",
          path: "path",
          commander: "commander",
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
    // Keep independent from global config to avoid tsconfig resolution issues
    // setupFiles: ["../../vitest.global.config.ts"],
  },
});
