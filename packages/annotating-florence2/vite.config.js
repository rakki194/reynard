import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: "src/index.ts",
            name: "ReynardAnnotatingFlorence2",
            fileName: "index",
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                "solid-js",
                "solid-js/web",
                "solid-js/store",
                "reynard-annotating-core",
            ],
            output: {
                globals: {
                    "solid-js": "SolidJS",
                    "solid-js/web": "SolidJSWeb",
                    "solid-js/store": "SolidJSStore",
                    "reynard-annotating-core": "ReynardAnnotatingCore",
                },
            },
        },
    },
    test: {
        environment: "happy-dom",
        globals: true,
    },
});
