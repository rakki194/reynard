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

// New catalyst-powered CLI
export { MarkdownValidationCLI } from "./markdownCLI.js";
