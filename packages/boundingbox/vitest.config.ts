import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-boundingbox",
  setupFiles: ["./src/test-setup.ts"],
});
