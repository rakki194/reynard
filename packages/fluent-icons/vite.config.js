import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReynardFluentIcons",
            fileName: (format) => {
                if (format === "es")
                    return "index.js";
                if (format === "cjs")
                    return "index.cjs";
                return `index.${format}`;
            },
            formats: ["es", "cjs", "umd"],
        },
        rollupOptions: {
            external: ["solid-js", "reynard-core"],
            output: {
                globals: {
                    "solid-js": "solid",
                    "reynard-core": "ReynardCore",
                },
            },
        },
        target: "esnext",
        sourcemap: true,
        cssCodeSplit: false,
    },
    // Handle SVG imports with ?raw suffix
    assetsInclude: ["**/*.svg"],
    optimizeDeps: {
        include: ["@fluentui/svg-icons"],
    },
});
