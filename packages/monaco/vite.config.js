import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReynardMonaco",
            fileName: "index",
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                "solid-js",
                "solid-js/web",
                "solid-js/store",
                "monaco-editor",
                "@monaco-editor/loader",
            ],
            output: {
                globals: {
                    "solid-js": "SolidJS",
                    "solid-js/web": "SolidJSWeb",
                    "solid-js/store": "SolidJSStore",
                    "monaco-editor": "monaco",
                    "@monaco-editor/loader": "MonacoLoader",
                },
            },
        },
        sourcemap: true,
        minify: false,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
});
