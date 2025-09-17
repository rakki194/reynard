/**
 * Vitest configuration for Reynard Components
 * Uses reynard-testing package for consistent testing setup
 */
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
export default defineConfig({
    plugins: [solid()],
    test: {
        environment: "happy-dom",
        globals: true,
        setupFiles: ["./src/__tests__/setup.ts"],
        include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
        exclude: ["node_modules", "dist", ".git", ".cache"],
        environmentOptions: {
            happyDOM: {
                url: "http://localhost:3000",
                settings: {
                    disableJavaScriptFileLoading: true,
                    disableJavaScriptEvaluation: true,
                    disableCSSFileLoading: true,
                },
            },
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 85,
                    lines: 85,
                    statements: 85,
                },
            },
            exclude: [
                "node_modules/",
                "src/__tests__/",
                "**/*.d.ts",
                "**/*.config.*",
                "**/setup.*",
                "**/fixtures/**",
                "**/mocks/**",
            ],
        },
        testTimeout: 10000,
        hookTimeout: 10000,
    },
    resolve: {
        conditions: ["development", "browser"],
    },
});
