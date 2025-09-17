import { defineConfig } from "vite";
import { resolve } from "path";
export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReynardColorMedia",
            fileName: "index",
            formats: ["es", "umd"],
        },
        rollupOptions: {
            external: ["solid-js"],
            output: {
                globals: {
                    "solid-js": "SolidJS",
                },
            },
        },
        sourcemap: true,
    },
    resolve: {
        alias: {
            "~": resolve(__dirname, "src"),
        },
    },
});
