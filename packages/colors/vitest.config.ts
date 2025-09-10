import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-colors",
  setupFiles: ["../../packages/testing/src/test-setup.ts"],
});
