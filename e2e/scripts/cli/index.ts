/**
 * CLI Package Barrel Export
 *
 * Centralized exports for the trace analyzer CLI system.
 * This follows the Reynard modular architecture pattern.
 */

// Core CLI components
export { TraceAnalyzerCLI } from "./trace-analyzer-cli";

// Options and parsing
export { HelpSystem } from "./help";
export { HelpRequestedError, OptionsParser } from "./options-parser";

// Output handlers
export { ConsoleOutputHandler, JsonOutputHandler, MarkdownOutputHandler } from "./output";

// Comparison functionality
export { TraceComparison } from "./comparison";

// Types
export type {
  BottleneckInfo,
  CLIOptions,
  ChangeInfo,
  ComparisonResult,
  ErrorInfo,
  OutputFormat,
  PerformanceChangeInfo,
  PerformanceMetrics,
  ResourceInfo,
  ScreenshotInfo,
  TraceAnalysis,
} from "./types";
