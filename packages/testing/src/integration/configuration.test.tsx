import { describe, it, expect } from "vitest";
import {
  createBaseVitestConfig,
  createComponentTestConfig,
  createUtilityTestConfig,
  createIntegrationTestConfig,
} from "../index";

describe("Configuration Integration", () => {
  it("should create different config types with appropriate coverage thresholds", () => {
    const baseConfig = createBaseVitestConfig({ packageName: "test" });
    const componentConfig = createComponentTestConfig("test");
    const utilityConfig = createUtilityTestConfig("test");
    const integrationConfig = createIntegrationTestConfig("test");

    // Component config should have higher thresholds than base
    expect(
      (componentConfig.test?.coverage as any)?.thresholds?.global?.functions,
    ).toBeGreaterThan(
      (baseConfig.test?.coverage as any)?.thresholds?.global?.functions,
    );

    // Utility config should have highest thresholds
    expect(
      (utilityConfig.test?.coverage as any)?.thresholds?.global?.functions,
    ).toBeGreaterThan(
      (componentConfig.test?.coverage as any)?.thresholds?.global?.functions,
    );

    // Integration config should have lower thresholds
    expect(
      (integrationConfig.test?.coverage as any)?.thresholds?.global?.functions,
    ).toBeLessThan(
      (baseConfig.test?.coverage as any)?.thresholds?.global?.functions,
    );
  });
});
