import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-connection",
  setupFiles: ["./src/test-setup.ts"],
});
