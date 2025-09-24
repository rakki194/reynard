import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{js,ts,tsx}", "src/**/__tests__/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: ["node_modules", "dist", "build", "coverage"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/__tests__/**",
        "**/test/**",
        "**/tests/**"
      ]
    }
  }
});
