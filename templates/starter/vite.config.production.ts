import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    target: "esnext",
    sourcemap: false, // Disable sourcemaps in production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["solid-js"],
          ui: ["reynard-components", "reynard-ui"],
          themes: ["reynard-themes", "reynard-colors"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "reynard-core": new URL("../../packages/core/src", import.meta.url).pathname,
      "reynard-components": new URL("../../packages/components/src", import.meta.url).pathname,
      "reynard-themes": new URL("../../packages/themes/src", import.meta.url).pathname,
      "reynard-charts": new URL("../../packages/charts/src", import.meta.url).pathname,
      "reynard-fluent-icons": new URL("../../packages/fluent-icons/src", import.meta.url).pathname,
    },
  },
});
