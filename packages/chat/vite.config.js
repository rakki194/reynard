import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReynardChat",
            formats: ["es", "cjs"],
            fileName: (format) => `index.${format === "es" ? "js" : format}`,
        },
        rollupOptions: {
            external: [
                "solid-js",
                "solid-js/web",
                "reynard-core",
                "reynard-fluent-icons",
            ],
            output: {
                globals: {
                    "solid-js": "solid",
                    "solid-js/web": "solidWeb",
                    "reynard-core": "ReynardCore",
                    "reynard-fluent-icons": "ReynardFluentIcons",
                },
                assetFileNames: (assetInfo) => {
                    const assetName = assetInfo.fileName;
                    if (assetName === "style.css") {
                        return "styles.css";
                    }
                    if (assetName === "chat.css") {
                        return "styles.css";
                    }
                    return assetName || "asset";
                },
            },
        },
        target: "esnext",
        sourcemap: true,
        cssCodeSplit: false,
    },
});
