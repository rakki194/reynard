import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-error-boundaries",
  setupFiles: ["./src/test-setup.ts"],
});
