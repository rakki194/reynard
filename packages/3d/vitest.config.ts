import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-3d",
  setupFiles: ["src/test-setup.ts"],
});
