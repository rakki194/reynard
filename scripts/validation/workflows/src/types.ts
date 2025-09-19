/**
 * 🐺 TypeScript Types for Workflow Shell Extractor
 * Comprehensive type definitions for workflow script extraction and validation
 */

export interface WorkflowScript {
  /** Path to the workflow file */
  workflow: string;
  /** Name identifier for the script */
  name: string;
  /** Starting line number in the workflow file */
  startLine: number;
  /** Ending line number in the workflow file */
  endLine: number;
  /** The extracted shell script content */
  content: string;
  /** Type of script extraction (multiline, inline, etc.) */
  type: "multiline" | "inline" | "single-line";
}

export interface ValidationResult {
  /** Whether the script passed validation */
  valid: boolean;
  /** Array of validation issues found */
  issues: string[];
  /** Path to the temporary script file used for validation */
  script: string;
  /** Additional metadata about the validation */
  metadata?: {
    /** Shellcheck version used */
    shellcheckVersion?: string;
    /** Validation timestamp */
    timestamp?: Date;
    /** Number of lines validated */
    lineCount?: number;
  };
}

export interface ValidationIssue {
  /** Line number where the issue occurs */
  line: number;
  /** Column number where the issue occurs */
  column: number;
  /** Severity level of the issue */
  severity: "error" | "warning" | "info" | "style";
  /** Shellcheck error code */
  code: string;
  /** Human-readable description of the issue */
  message: string;
  /** Suggested fix for the issue */
  fix?: string;
}

export interface ScriptFix {
  /** Type of fix to apply */
  type: "replace" | "insert" | "delete" | "wrap";
  /** Pattern to match for replacement */
  pattern: RegExp | string;
  /** Replacement text or insertion content */
  replacement: string;
  /** Description of what the fix does */
  description: string;
  /** Priority of the fix (higher = more important) */
  priority?: number;
  /** Whether this fix is safe to apply automatically */
  safe?: boolean;
}

export interface ExtractorOptions {
  /** Directory containing workflow files */
  workflowDir?: string | undefined;
  /** Temporary directory for script extraction */
  tempDir?: string | undefined;
  /** Path to shellcheck configuration file */
  shellcheckRc?: string | undefined;
  /** Enable verbose output */
  verbose?: boolean | undefined;
  /** Enable automatic fixing mode */
  fixMode?: boolean | undefined;
  /** Maximum number of scripts to process */
  maxScripts?: number | undefined;
  /** File patterns to include */
  includePatterns?: string[] | undefined;
  /** File patterns to exclude */
  excludePatterns?: string[] | undefined;
}

export interface ProcessResult {
  /** Whether all scripts passed validation */
  success: boolean;
  /** Array of extracted scripts */
  scripts: WorkflowScript[];
  /** Array of validation results */
  results: Array<{
    script: WorkflowScript;
    validation: ValidationResult;
  }>;
  /** Summary statistics */
  summary: {
    /** Total number of scripts found */
    totalScripts: number;
    /** Number of valid scripts */
    validScripts: number;
    /** Number of invalid scripts */
    invalidScripts: number;
    /** Number of fixes applied */
    fixesApplied: number;
  };
  /** Processing metadata */
  metadata: {
    /** Start time of processing */
    startTime: Date;
    /** End time of processing */
    endTime: Date;
    /** Total processing duration in milliseconds */
    duration: number;
    /** Number of workflow files processed */
    workflowFilesProcessed: number;
  };
}

export interface WorkflowFile {
  /** Full path to the workflow file */
  path: string;
  /** Base name of the workflow file */
  name: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  modified: Date;
  /** Whether the file is readable */
  readable: boolean;
}

export interface ColorConfig {
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  reset: string;
  bold: string;
}

export interface Logger {
  log(message: string, color?: keyof ColorConfig): void;
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  success(message: string): void;
  section(title: string): void;
}

export interface ShellcheckConfig {
  /** Path to shellcheck executable */
  executable: string;
  /** Path to configuration file */
  configFile: string;
  /** Additional shellcheck options */
  options: string[];
  /** Shell dialect to use */
  shell: "bash" | "sh" | "dash" | "ksh";
}

export interface FixApplicationResult {
  /** Whether any fixes were applied */
  applied: boolean;
  /** Number of fixes applied */
  count: number;
  /** Array of applied fixes */
  fixes: ScriptFix[];
  /** Path to the modified file */
  filePath: string;
  /** Backup path if backup was created */
  backupPath?: string;
}
