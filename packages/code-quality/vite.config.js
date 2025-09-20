import { resolve } from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, "src/index.ts"),
                cli: resolve(__dirname, "src/cli.ts"),
            },
            name: "ReynardCodeQuality",
            formats: ["es", "cjs"],
            fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : format}`,
        },
        rollupOptions: {
            external: ["solid-js", "chokidar", "commander", "fs/promises", "path", "child_process", "events", "util"],
            output: {
                globals: {
                    "solid-js": "SolidJS",
                    chokidar: "chokidar",
                    commander: "commander",
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
