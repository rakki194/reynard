import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReynardCollaboration",
      fileName: format => `index.${format === "es" ? "js" : "cjs"}`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "solid-js/store",
        "yjs",
        "y-monaco",
        "y-webrtc",
        "y-indexeddb",
        "y-websocket",
        "y-protocols",
        "reynard-connection",
        "reynard-monaco",
        "reynard-core",
        "reynard-auth",
        "reynard-validation",
      ],
      output: {
        globals: {
          "solid-js": "SolidJS",
          "solid-js/web": "SolidJSWeb",
          "solid-js/store": "SolidJSStore",
          yjs: "Yjs",
          "y-monaco": "YMonaco",
          "y-webrtc": "YWebRTC",
          "y-indexeddb": "YIndexedDB",
          "y-websocket": "YWebSocket",
          "y-protocols": "YProtocols",
          "reynard-connection": "ReynardConnection",
          "reynard-monaco": "ReynardMonaco",
          "reynard-core": "ReynardCore",
          "reynard-auth": "ReynardAuth",
          "reynard-validation": "ReynardValidation",
        },
      },
    },
    target: "esnext",
    minify: false,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
