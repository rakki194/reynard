/**
 * 🦊 Reynard Incremental Linting Index
 * 
 * Main export for incremental linting functionality in code-quality.
 */

export { IncrementalLintingService } from "./IncrementalLintingService.js";
export type {
  IncrementalLintingConfig,
  LintingProcessor,
  LintResult,
  LintIssue,
  LintingQueueStatus,
  LintingCacheEntry,
  LintingStats
} from "./IncrementalLintingService.js";
