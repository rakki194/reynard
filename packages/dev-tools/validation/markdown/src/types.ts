/**
 * 🦊 Types for Markdown Validation Tools
 *
 * Core type definitions for markdown validation functionality
 */

export interface ValidationResult {
  /** Whether the validation passed */
  success: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Warning messages */
  warnings?: string[];
  /** Information about what was fixed */
  fixes?: string[];
}

export interface ToCAnalysis {
  /** Number of ToC sections found */
  tocCount: number;
  /** Number of ToC entries */
  entryCount: number;
  /** Whether duplicate entries were found */
  hasDuplicates: boolean;
  /** List of duplicate entries */
  duplicates: string[];
  /** All ToC entries found */
  entries: string[];
  /** Whether a conflict was detected */
  hasConflict: boolean;
  /** Conflict details */
  conflictDetails?: string;
}

export interface ToCValidationOptions {
  /** Whether to fix issues automatically */
  fix?: boolean;
  /** Whether to be verbose in output */
  verbose?: boolean;
  /** Custom ToC section header pattern */
  tocHeaderPattern?: RegExp;
  /** Whether to detect conflicts between multiple validators */
  detectConflicts?: boolean;
}

export interface LinkValidationOptions {
  /** Whether to check external links */
  checkExternal?: boolean;
  /** Whether to check internal links */
  checkInternal?: boolean;
  /** Timeout for external link checks (ms) */
  timeout?: number;
  /** Whether to be verbose in output */
  verbose?: boolean;
}

export interface SentenceLengthOptions {
  /** Maximum sentence length */
  maxLength?: number;
  /** Whether to fix long sentences automatically */
  fix?: boolean;
  /** Whether to be verbose in output */
  verbose?: boolean;
}

export interface ValidationOptions extends ToCValidationOptions, LinkValidationOptions, SentenceLengthOptions {
  /** Type of validation to perform */
  type: "toc" | "links" | "sentence-length" | "all";
}

export interface MarkdownFile {
  /** File path */
  path: string;
  /** File content */
  content: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  modified: Date;
}
