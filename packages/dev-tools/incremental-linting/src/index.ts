/**
 * 🦊 Reynard Incremental Linting Package
 * ======================================
 *
 * This package provides incremental linting with queue management for the Reynard framework.
 * It integrates with the existing queue-watcher system to provide efficient, gentle linting
 * that doesn't overwhelm the system with subprocesses.
 */

// Export main classes and functions
export { IncrementalLintingService } from "./linting-service.js";
export { LintingQueueManager } from "./queue-manager.js";
export { LintingProcessors } from "./processors.js";

// Export types
export type {
  LintingService,
  LintingProcessor,
  LintResult,
  LintIssue,
  LintingQueueStatus,
  IncrementalLintingConfig,
  LinterConfig,
  LintingCacheEntry,
  LintingStats,
  LintSeverity,
  VSCodeIntegration,
} from "./types.js";

// Export utilities
export { createDefaultConfig, loadConfig, saveConfig } from "./config.js";

// Default export
export { IncrementalLintingService as default } from "./linting-service.js";




