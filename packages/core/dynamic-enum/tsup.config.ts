import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['solid-js'],
  treeshake: true,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
  tsconfig: 'tsconfig.build.json'
});
