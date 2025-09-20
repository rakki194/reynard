import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: {
        index: "./src/index.ts",
        core: "./src/core/index.ts",
        registry: "./src/registry/index.ts",
        dependencies: "./src/dependencies/index.ts",
        presets: "./src/presets/index.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "js" : "cjs";
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ["solid-js"],
      output: {
        globals: {
          "solid-js": "SolidJS",
        },
      },
    },
    target: "esnext",
    sourcemap: true,
  },
});
