import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-annotating",
  setupFiles: ["./src/test-setup.ts"],
});
