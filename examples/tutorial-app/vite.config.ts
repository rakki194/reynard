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
        manualChunks: {
          "reynard-core": ["reynard-core"],
          "reynard-themes": ["reynard-themes"],
          "reynard-components-core": ["reynard-components-core"],
        },
      },
    },
  },
});
