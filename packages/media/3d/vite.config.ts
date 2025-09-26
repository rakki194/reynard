import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Reynard3D",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["solid-js", "three", "three/examples/jsm/controls/OrbitControls.js", "reynard-primitives"],
      output: {
        globals: {
          "solid-js": "SolidJS",
          three: "THREE",
          "three/examples/jsm/controls/OrbitControls.js": "THREE.OrbitControls",
        },
      },
    },
    target: "es2022",
    sourcemap: true,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["src/test-setup.ts"],
  },
});
