/**
 * 🐺 Workflow Shell Extractor - Main Export
 * Main entry point for the workflow shell script extraction and validation tool
 */

export { WorkflowShellExtractor } from "./WorkflowShellExtractor.js";
// WorkflowLogger removed - now using ReynardLogger from catalyst
export { ScriptExtractor } from "./scriptExtractor.js";
export { ScriptValidator } from "./scriptValidator.js";
export { ScriptFixer } from "./scriptFixer.js";
export { WorkflowFileManager } from "./workflowFileManager.js";
// Old FileManager removed - replaced with WorkflowFileManager that extends catalyst FileManager
export { ReportGenerator } from "./reportGenerator.js";
export { WorkflowProcessor } from "./workflowProcessor.js";
export { ExtractorFactory } from "./extractorFactory.js";
export { FixGenerator } from "./fixGenerator.js";

export type {
  WorkflowScript,
  ValidationResult,
  ValidationIssue,
  ScriptFix,
  ExtractorOptions,
  ProcessResult,
  WorkflowFile,
  ColorConfig,
  Logger,
  ShellcheckConfig,
  FixApplicationResult,
} from "./types.js";

// Re-export for convenience
export { WorkflowShellExtractor as default } from "./WorkflowShellExtractor.js";
