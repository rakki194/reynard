/**
 * Mock Backend Server for E2E Authentication Testing
 *
 * Provides a comprehensive mock backend server that simulates the Reynard backend
 * and Gatekeeper authentication endpoints for testing purposes.
 *
 * This is a barrel export file that re-exports all mock utilities for backward compatibility.
 */

// Re-export all types
export type { MockBackendConfig, MockResponse } from "./mock-types";

// Re-export all classes and functions
export { MockBackendServer } from "./mock-backend-server";
export { createMockBackendServer } from "./mock-server-factory";

export { MockApiClient } from "./mock-api-client";

export { AuthMockHelpers } from "../auth/auth-mock-helpers";
