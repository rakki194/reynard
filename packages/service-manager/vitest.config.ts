import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-service-manager",
  setupFiles: ["./src/test-setup.ts"],
});
