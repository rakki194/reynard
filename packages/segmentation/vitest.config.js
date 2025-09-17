import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        environment: "happy-dom",
        globals: true,
        setupFiles: ["./src/__tests__/setup.ts"],
        include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
        exclude: [
            "node_modules/",
            "**/node_modules/**",
            "dist/",
            "coverage/",
            "**/*.d.ts",
            "**/*.config.*",
        ],
        testTimeout: 10000, // 10 second timeout for individual tests
        hookTimeout: 10000, // 10 second timeout for setup/teardown hooks
        teardownTimeout: 10000, // 10 second timeout for teardown
        pool: "forks",
        poolOptions: {
            forks: {
                maxForks: 1,
                singleFork: true,
            },
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                "src/__tests__/",
                "**/*.d.ts",
                "**/*.config.*",
                "**/examples/**",
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": "./src",
        },
    },
});
