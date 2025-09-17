import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: {
                index: "src/index.ts",
                types: "src/types/index.ts",
                services: "src/services/index.ts",
                utils: "src/utils/index.ts",
                models: "src/models/index.ts",
            },
            formats: ["es"],
            fileName: (format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
            external: ["solid-js", "solid-js/web", "solid-js/store"],
            output: {
                globals: {
                    "solid-js": "SolidJS",
                    "solid-js/web": "SolidJSWeb",
                    "solid-js/store": "SolidJSStore",
                },
            },
        },
        target: "esnext",
        sourcemap: true,
    },
    test: {
        environment: "happy-dom",
        globals: true,
        setupFiles: ["./src/test-setup.ts"],
    },
});
