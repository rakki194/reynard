import { createBaseVitestConfig } from "reynard-testing/config";

export default createBaseVitestConfig({
  packageName: "reynard-fluent-icons",
  setupFiles: ["./src/__tests__/setup.ts"],
});
