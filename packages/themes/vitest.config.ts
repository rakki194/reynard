import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-themes",
  setupFiles: ["./src/__tests__/setup.ts"],
});
