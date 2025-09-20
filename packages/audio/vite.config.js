import { resolve } from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReynardAudio",
            formats: ["es", "cjs"],
            fileName: format => `index.${format === "es" ? "js" : format}`,
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
        target: "esnext",
    },
    resolve: {
        alias: {
            "~": resolve(__dirname, "src"),
        },
    },
});
