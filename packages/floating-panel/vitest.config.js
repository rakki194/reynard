import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test-setup.ts"],
        reporters: [["default", { summary: false }]],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            thresholds: {
                global: {
                    branches: 85,
                    functions: 90,
                    lines: 90,
                    statements: 90,
                },
            },
            exclude: [
                "node_modules/",
                "dist/",
                "coverage/",
                "**/*.d.ts",
                "**/*.config.*",
                "**/test-setup.ts",
                "**/fixtures/**",
                "**/mocks/**",
            ],
        },
    },
    resolve: {
        alias: {
            "~": new URL("./src", import.meta.url).pathname,
        },
    },
});
