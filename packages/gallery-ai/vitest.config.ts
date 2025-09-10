import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-gallery-ai",
  setupFiles: ["./src/test-setup.ts"],
});
