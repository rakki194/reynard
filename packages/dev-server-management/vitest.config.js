/**
 * 🦊 Vitest Configuration for Dev Server Management
 *
 * Comprehensive test configuration for the development server management system.
 * Includes coverage, environment setup, and test utilities.
 */
import { defineConfig } from "vitest/config";
import { resolve } from "path";
export default defineConfig({
    test: {
        // Test environment
        environment: "node",
        globals: true,
        // Test file patterns
        include: ["src/**/*.{test,spec}.{js,ts}"],
        exclude: ["node_modules/**", "dist/**", "**/*.d.ts", "src/__tests__/setup.ts", "src/__tests__/test-utils.ts"],
        // Test timeout
        testTimeout: 10000,
        hookTimeout: 10000,
        // Coverage configuration
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "lcov"],
            reportsDirectory: "./coverage",
            exclude: [
                "node_modules/**",
                "dist/**",
                "**/*.d.ts",
                "**/*.test.{js,ts}",
                "**/*.spec.{js,ts}",
                "**/__tests__/**",
                "**/test-utils.ts",
                "**/vitest.config.ts",
                "**/vite.config.ts",
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
        // Test setup
        setupFiles: ["./src/__tests__/setup.ts"],
        // Reporter configuration
        reporter: ["verbose"],
        // Watch mode configuration
        watch: false,
        // Pool configuration for parallel tests
        pool: "threads",
        poolOptions: {
            threads: {
                singleThread: false,
            },
        },
        // Test isolation
        isolate: true,
        // Mock configuration
        mockReset: true,
        restoreMocks: true,
        clearMocks: true,
    },
    // Resolve configuration
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@tests": resolve(__dirname, "src/__tests__"),
            "@core": resolve(__dirname, "src/core"),
            "@cli": resolve(__dirname, "src/cli"),
            "@types": resolve(__dirname, "src/types"),
        },
    },
    // Define global constants
    define: {
        __TEST__: true,
        __DEV__: false,
        __PROD__: false,
    },
});
