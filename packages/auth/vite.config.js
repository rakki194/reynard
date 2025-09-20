import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";
export default defineConfig({
    plugins: [solid()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ReynardAuth",
            fileName: format => (format === "es" ? "index.js" : `index.${format}`),
        },
        rollupOptions: {
            external: [
                "solid-js",
                "solid-js/web",
                "reynard-core",
                "reynard-components",
                "jwt-decode",
                "@zxcvbn-ts/core",
                "@zxcvbn-ts/language-common",
                "@zxcvbn-ts/language-en",
            ],
            output: {
                globals: {
                    "solid-js": "solid",
                    "solid-js/web": "solidWeb",
                    "reynard-core": "ReynardCore",
                    "reynard-components-core": "ReynardComponentsCore",
                    "jwt-decode": "jwtDecode",
                    "@zxcvbn-ts/core": "ZxcvbnCore",
                    "@zxcvbn-ts/language-common": "ZxcvbnLanguageCommon",
                    "@zxcvbn-ts/language-en": "ZxcvbnLanguageEn",
                },
            },
        },
        target: "esnext",
        sourcemap: true,
    },
});
