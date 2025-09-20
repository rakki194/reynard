import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: "src/index.ts",
            name: "ReynardGalleryAI",
            fileName: format => `index.${format === "es" ? "js" : "cjs"}`,
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            external: [
                "solid-js",
                "solid-js/web",
                "solid-js/store",
                "reynard-gallery",
                "reynard-annotating-core",
                "reynard-caption",
                "reynard-ai-shared",
                "reynard-core",
                "reynard-components",
                "@solid-primitives/intersection-observer",
                "@solid-primitives/resize-observer",
                "@solid-primitives/event-listener",
            ],
            output: {
                globals: {
                    "solid-js": "SolidJS",
                    "solid-js/web": "SolidJSWeb",
                    "solid-js/store": "SolidJSStore",
                    "reynard-gallery": "ReynardGallery",
                    "reynard-annotating-core": "ReynardAnnotatingCore",
                    "reynard-caption": "ReynardCaption",
                    "reynard-ai-shared": "ReynardAIShared",
                    "reynard-core": "ReynardCore",
                    "reynard-components-core": "ReynardComponentsCore",
                },
            },
        },
        sourcemap: true,
        minify: false,
    },
    test: {
        environment: "happy-dom",
        globals: true,
        setupFiles: ["./src/test-setup.ts"],
    },
});
