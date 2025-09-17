/**
 * 🦊 Reynard Git Automation
 *
 * Modular Git workflow automation tools for the Reynard ecosystem.
 * Provides clean, composable components for managing Git operations,
 * versioning, changelog management, and more.
 */

// Core components
export { JunkFileDetector, type JunkDetectionResult, type JunkFileResult } from "./junk-detector.js";
export { ChangeAnalyzer, type ChangeAnalysisResult, type ChangeCategory, type FileChange } from "./change-analyzer.js";
export { CommitMessageGenerator, type CommitMessage, type CommitMessageOptions } from "./commit-generator.js";
export {
  ChangelogManager,
  type ChangelogStructure,
  type ChangelogSection,
  type ChangelogEntry,
} from "./changelog-manager.js";
export { VersionManager, type VersionInfo, type PackageVersionInfo } from "./version-manager.js";
export { GitWorkflowOrchestrator, type WorkflowOptions, type WorkflowResult } from "./workflow-orchestrator.js";
