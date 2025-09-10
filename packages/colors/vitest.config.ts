import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-colors",
  setupFiles: ["./test/setup.ts"],
});
