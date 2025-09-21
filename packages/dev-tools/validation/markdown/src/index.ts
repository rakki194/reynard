/**
 * 🦊 Markdown Validation Tools
 *
 * Main entry point for markdown validation functionality
 */

export { ToCValidator } from "./toc-validator.js";
export { LinksValidator } from "./links-validator.js";
export { SentenceLengthValidator } from "./sentence-length-validator.js";
export type {
  ValidationResult,
  ToCAnalysis,
  ToCValidationOptions,
  LinkValidationOptions,
  SentenceLengthOptions,
  ValidationOptions,
  MarkdownFile,
} from "./types.js";

// Re-export CLI for programmatic access
export { default as cli } from "./cli.js";
