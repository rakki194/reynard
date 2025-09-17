/**
 * Test Data Fixtures Barrel Export
 *
 * Provides a centralized export point for all test data fixtures,
 * following the modular architecture pattern for easy importing.
 */

// User Data Module
export { ITestUserData, TestUserData } from "./user-data";

// Mock API Responses Module
export { IApiResponse, MockApiResponses } from "./mock-api-responses";

// Test Scenarios Module
export { IAuthFlowScenario, ISecurityTestScenario, IEdgeCaseScenario, TestScenarios } from "./test-scenarios";

// Environment Configuration Module
export { IEnvironmentConfig, TestEnvironmentConfig } from "./test-environment-config";
