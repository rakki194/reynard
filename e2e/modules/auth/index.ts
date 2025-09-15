/**
 * Authentication Module - Barrel Export
 *
 * 🦊 *whiskers twitch with strategic organization* Clean exports for all
 * authentication testing utilities in the Reynard e2e testing framework.
 */

// Core authentication operations
export { AuthCoreOperations } from "./auth-core-operations";
export { AuthElementVerification } from "./auth-element-verification";
export { AuthFlowScenarios } from "./auth-flow-scenarios";
export { AuthFormHandlers } from "./auth-form-handlers";
export { AuthFormUtilities } from "./auth-form-utilities";
export { AuthMockHelpers } from "./auth-mock-helpers";
export { AuthTokenManager } from "./auth-token-manager";
export { AuthUtilityHelpers } from "./auth-utility-helpers";
export { AuthVerificationHelpers } from "./auth-verification-helpers";

// Main authentication test helpers class
export { AuthTestHelpers } from "./auth-helpers";

// Utility functions
export { setupAuthTestEnvironment } from "./auth-utility-helpers";
