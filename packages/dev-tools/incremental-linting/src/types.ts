/**
 * 🦊 Reynard Incremental Linting Types
 * ====================================
 *
 * Type definitions for the incremental linting system with queue management.
 */

import type { ProcessingOptions, QueueStatus } from "reynard-queue-watcher";

/**
 * Linting severity levels
 */
export type LintSeverity = "error" | "warning" | "info" | "hint";

/**
 * Linting result for a single issue
 */
export interface LintIssue {
  /** Unique identifier for the issue */
  id: string;
  /** File path where the issue was found */
  filePath: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** End line number (1-based) */
  endLine?: number;
  /** End column number (1-based) */
  endColumn?: number;
  /** Issue severity */
  severity: LintSeverity;
  /** Issue message */
  message: string;
  /** Rule that triggered this issue */
  rule?: string;
  /** Source of the linting tool */
  source: string;
  /** Additional context or suggestions */
  suggestions?: string[];
  /** Whether this issue can be auto-fixed */
  fixable?: boolean;
  /** Auto-fix data */
  fix?: {
    range: [number, number];
    text: string;
  };
}

/**
 * Linting result for a file
 */
export interface LintResult {
  /** File path that was linted */
  filePath: string;
  /** List of issues found */
  issues: LintIssue[];
  /** Whether linting was successful */
  success: boolean;
  /** Error message if linting failed */
  error?: string;
  /** Time taken to lint (in milliseconds) */
  duration: number;
  /** Linter that produced this result */
  linter: string;
  /** Timestamp when linting was performed (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Linting configuration for a specific linter
 */
export interface LinterConfig {
  /** Linter name */
  name: string;
  /** Whether this linter is enabled */
  enabled: boolean;
  /** Command to run the linter */
  command: string;
  /** Arguments to pass to the linter */
  args: string[];
  /** File patterns this linter should process */
  patterns: string[];
  /** File patterns to exclude */
  excludePatterns: string[];
  /** Maximum file size to process (in bytes) */
  maxFileSize?: number;
  /** Timeout for linter execution (in milliseconds) */
  timeout?: number;
  /** Whether to run this linter in parallel */
  parallel?: boolean;
  /** Priority for this linter (higher = more important) */
  priority?: number;
  /** Working directory for the linter */
  workingDirectory?: string;
  /** Environment variables for the linter */
  env?: Record<string, string>;
}

/**
 * Incremental linting configuration
 */
export interface IncrementalLintingConfig {
  /** Root directory to watch */
  rootPath: string;
  /** List of linter configurations */
  linters: LinterConfig[];
  /** File patterns to include */
  includePatterns: string[];
  /** File patterns to exclude */
  excludePatterns: string[];
  /** Debounce delay for file changes (in milliseconds) */
  debounceDelay: number;
  /** Maximum number of concurrent linting processes */
  maxConcurrency: number;
  /** Whether to enable incremental mode */
  incremental: boolean;
  /** Cache directory for incremental results */
  cacheDir?: string;
  /** Whether to persist cache between runs */
  persistCache: boolean;
  /** Maximum cache age (in milliseconds) */
  maxCacheAge?: number;
  /** Whether to enable auto-fix */
  autoFix: boolean;
  /** Whether to run linting on save */
  lintOnSave: boolean;
  /** Whether to run linting on change */
  lintOnChange: boolean;
  /** Output format for results */
  outputFormat: "json" | "text" | "vscode";
  /** Whether to enable verbose logging */
  verbose: boolean;
}

/**
 * Linting queue status
 */
export interface LintingQueueStatus extends QueueStatus {
  /** Whether the service is running */
  isRunning: boolean;
  /** Number of files currently being linted */
  activeFiles: number;
  /** Number of files waiting to be linted */
  queuedFiles: number;
  /** Number of files that failed linting */
  failedFiles: number;
  /** Number of files that passed linting */
  passedFiles: number;
  /** Total number of files processed */
  totalFiles: number;
  /** Number of files with issues */
  filesWithIssues: number;
  /** Total number of issues found */
  totalIssues: number;
  /** Issues by severity */
  issuesBySeverity: Record<LintSeverity, number>;
  /** Average linting time per file */
  averageLintTime: number;
}

/**
 * Linting processor interface
 */
export interface LintingProcessor {
  /** Linter configuration */
  config: LinterConfig;
  /** Process a file for linting */
  processFile(filePath: string, options?: ProcessingOptions): Promise<LintResult>;
  /** Check if this processor can handle the given file */
  canProcess(filePath: string): boolean;
  /** Get the linter name */
  getLinterName(): string;
  /** Process method for queue integration */
  process(filePath: string, options?: ProcessingOptions): Promise<LintResult>;
}

/**
 * Linting service interface
 */
export interface LintingService {
  /** Start the linting service */
  start(): Promise<void>;
  /** Stop the linting service */
  stop(): Promise<void>;
  /** Lint a specific file */
  lintFile(filePath: string): Promise<LintResult>;
  /** Lint multiple files */
  lintFiles(filePaths: string[]): Promise<LintResult[]>;
  /** Get current queue status */
  getStatus(): LintingQueueStatus;
  /** Clear the linting cache */
  clearCache(): Promise<void>;
  /** Update configuration */
  updateConfig(config: Partial<IncrementalLintingConfig>): void;
}

/**
 * VS Code integration interface
 */
export interface VSCodeIntegration {
  /** Send linting results to VS Code */
  sendResults(results: LintResult[]): Promise<void>;
  /** Send a single issue to VS Code */
  sendIssue(issue: LintIssue): Promise<void>;
  /** Clear all issues for a file */
  clearFileIssues(filePath: string): Promise<void>;
  /** Clear all issues */
  clearAllIssues(): Promise<void>;
  /** Get VS Code workspace configuration */
  getWorkspaceConfig(): Promise<IncrementalLintingConfig>;
}

/**
 * Linting cache entry
 */
export interface LintingCacheEntry {
  /** File path */
  filePath: string;
  /** File hash */
  fileHash: string;
  /** Linting results */
  results: LintResult[];
  /** Timestamp when cached */
  timestamp: Date;
  /** Cache expiration time */
  expiresAt: Date;
}

/**
 * Linting statistics
 */
export interface LintingStats {
  /** Total files processed */
  totalFiles: number;
  /** Files with issues */
  filesWithIssues: number;
  /** Total issues found */
  totalIssues: number;
  /** Issues by severity */
  issuesBySeverity: Record<LintSeverity, number>;
  /** Average linting time */
  averageLintTime: number;
  /** Total linting time */
  totalLintTime: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Linter performance */
  linterPerformance: Record<string, {
    filesProcessed: number;
    averageTime: number;
    totalTime: number;
    issuesFound: number;
  }>;
}




