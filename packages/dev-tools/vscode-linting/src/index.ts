/**
 * 🦊 Reynard VS Code Linting Extension
 * ====================================
 *
 * Main entry point for the VS Code extension.
 */

// Export main classes and functions
export { activate, deactivate } from "./extension.js";
export { VSCodeLintingProvider } from "./linting-provider.js";
export { LintingStatusBar } from "./status-bar.js";
export { LintingConfiguration } from "./configuration.js";

// Export types
export type { StatusType } from "./status-bar.js";

// Default export
export { activate as default } from "./extension.js";


