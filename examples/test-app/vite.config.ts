import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries
          if (id.includes("node_modules")) {
            if (id.includes("solid-js")) {
              return "solid-vendor";
            }
            return "vendor";
          }
        },
      },
    },
    // Increase chunk size warning limit for Monaco Editor
    chunkSizeWarningLimit: 1000,
  },
});
