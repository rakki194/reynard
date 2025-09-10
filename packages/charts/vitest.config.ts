import { createComponentTestConfig } from "reynard-testing/config";
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

const baseConfig = createComponentTestConfig("reynard-charts");

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins!,
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
    ...baseConfig.test,
    setupFiles: ["./test/setup.ts"],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});
