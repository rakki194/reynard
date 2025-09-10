import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-file-processing",
  setupFiles: ["./src/test-setup.ts"],
});
