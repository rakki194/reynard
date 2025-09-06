/**
 * Configuration exports for @reynard/testing
 */

export { createBaseVitestConfig, createComponentTestConfig, createUtilityTestConfig, createIntegrationTestConfig } from "./vitest.base";
export { default as componentTestConfig } from "./vitest.component";
export { default as integrationTestConfig } from "./vitest.integration";
export { default as e2eTestConfig } from "./vitest.e2e";
