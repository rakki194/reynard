import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-model-management",
  setupFiles: ["./src/test-setup.ts"],
});
