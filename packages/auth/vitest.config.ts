import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-auth",
  setupFiles: ["./src/test-setup.ts"],
});
