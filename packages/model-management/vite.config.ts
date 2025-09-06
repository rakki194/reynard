import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReynardModelManagement',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js', 'reynard-core', 'reynard-service-manager'],
      output: {
        globals: {
          'solid-js': 'SolidJS',
          'reynard-core': 'ReynardCore',
          'reynard-service-manager': 'ReynardServiceManager'
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts']
  }
});
