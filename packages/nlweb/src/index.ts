/**
 * NLWeb Package
 *
 * Main entry point for the NLWeb assistant tooling and routing system.
 */

// Export types
export * from "./types/index.js";

// Export service classes
export { NLWebService, createDefaultNLWebConfiguration, SimpleEventEmitter } from "./service/NLWebService.js";
export { NLWebRouter } from "./router/NLWebRouter.js";
export { NLWebToolRegistry } from "./router/NLWebToolRegistry.js";

// Export API utilities
export { createNLWebAPI } from "./api/NLWebAPI.js";

// Re-export commonly used types for convenience
export type {
  NLWebTool,
  NLWebSuggestion,
  NLWebContext,
  NLWebQuery,
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
  NLWebConfiguration,
  NLWebHealthStatus,
  NLWebPerformanceStats,
} from "./types/index.js";
