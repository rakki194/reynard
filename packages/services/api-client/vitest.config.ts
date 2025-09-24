import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: ["node_modules", "dist", "build", "coverage"],
    environment: "happy-dom",
    globals: true,
  },
});
