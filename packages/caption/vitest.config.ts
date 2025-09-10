import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-caption",
  setupFiles: ["./src/test-setup.ts"],
});
