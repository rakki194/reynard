import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'solid-js': ['solid-js'],
          'solid-router': ['solid-router'],
          'reynard-core': ['reynard-core'],
          'reynard-components': ['reynard-components'],
          'reynard-themes': ['reynard-themes'],
          'reynard-docs-core': ['reynard-docs-core'],
          'reynard-docs-components': ['reynard-docs-components']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts']
  }
});
