import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import dts from "vite-plugin-dts";
export default defineConfig({
    plugins: [solid(), dts()],
    build: {
        lib: {
            entry: "src/index.ts",
            name: "ReynardFloatingPanel",
            fileName: "index",
            formats: ["es", "cjs", "umd"],
        },
        rollupOptions: {
            external: ["solid-js"],
            output: {
                globals: {
                    "solid-js": "SolidJS",
                },
            },
        },
    },
});
