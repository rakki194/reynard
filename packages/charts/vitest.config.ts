import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    solid(),
    {
      name: "mock-chartjs-adapter",
      resolveId(id) {
        if (id === "chartjs-adapter-date-fns") {
          return id;
        }
        return null;
      },
      load(id) {
        if (id === "chartjs-adapter-date-fns") {
          return "export default {};";
        }
        return null;
      },
    },
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
