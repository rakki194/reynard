import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-core",
  setupFiles: ["./src/test-setup.ts"],
  coverageThresholds: {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90,
  },
});
