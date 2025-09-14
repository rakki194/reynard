#!/usr/bin/env node
/**
 * Shared Validation Utilities for Reynard Framework
 *
 * Centralized exports for all shared validation utilities.
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

// Color system
export {
  Colors,
  printColored,
  printError,
  printHeader,
  printInfo,
  printSection,
  printSuccess,
  printWarning,
} from "./colors.js";

// File utilities
export {
  DEFAULT_IGNORE_PATTERNS,
  findProjectRoot,
  getAllFiles,
  getAllMarkdownFiles,
  getFileExtension,
  getRelativePath,
  getStagedFiles,
  getStagedMarkdownFiles,
  isFileReadable,
  resolveRelativePath,
  safeReadFile,
  safeWriteFile,
  scanDirectory,
  shouldExcludeDirectory,
} from "./file-utils.js";

// CLI utilities
export {
  COMMON_ARGS,
  createProgressIndicator,
  generateHelp,
  handleExit,
  measureTime,
  parseCommonArgs,
  printProgress,
  retryWithBackoff,
  showHelp,
  validateDependencies,
} from "./cli-utils.js";

// Validation base classes
export {
  BaseValidator,
  FileValidationResult,
  ValidationResult,
  createError,
  createResult,
  createValid,
  createWarning,
} from "./validation-base.js";

// Re-export default objects for convenience
export { default as CLIUtils } from "./cli-utils.js";
export { default as Colors } from "./colors.js";
export { default as FileUtils } from "./file-utils.js";
export { default as ValidationBase } from "./validation-base.js";
