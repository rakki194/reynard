import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-games",
  setupFiles: ["./src/test-setup.ts"],
});
