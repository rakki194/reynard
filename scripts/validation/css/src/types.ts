/**
 * 🦊 TypeScript Types for CSS Variable Validator
 * Comprehensive type definitions for CSS variable validation and analysis
 */

export interface CSSVariableDefinition {
  /** Variable name without the -- prefix */
  name: string;
  /** Variable value */
  value: string;
  /** Line number where the variable is defined */
  line: number;
  /** Theme context (default, dark, light, etc.) */
  theme: string;
  /** File path where the variable is defined */
  file: string;
  /** Full context line for debugging */
  context: string;
  /** File path if imported from another file */
  importedFrom?: string;
  /** File path that imported this variable */
  importedVia?: string;
}

export interface CSSVariableUsage {
  /** Variable name without the -- prefix */
  name: string;
  /** Line number where the variable is used */
  line: number;
  /** File path where the variable is used */
  file: string;
  /** Full context line for debugging */
  context: string;
  /** File path if imported from another file */
  importedFrom?: string;
  /** File path that imported this variable */
  importedVia?: string;
}

export interface CSSImport {
  /** Original import path as written in CSS */
  originalPath: string;
  /** Resolved absolute path */
  resolvedPath: string;
  /** Line number of the import */
  line: number;
  /** File that contains the import */
  importingFile: string;
}

export interface CSSFileVariables {
  /** Variable definitions found in the file */
  definitions: CSSVariableDefinition[];
  /** Variable usages found in the file */
  usage: CSSVariableUsage[];
  /** Theme mappings found in the file */
  themes: Map<string, string>;
  /** Import statements found in the file */
  imports: CSSImport[];
}

export interface ValidationIssue {
  /** Type of validation issue */
  type: "missing" | "unused" | "typo" | "inconsistency" | "import_error";
  /** Severity level */
  severity: "error" | "warning" | "info";
  /** Variable name (if applicable) */
  variable?: string;
  /** Description of the issue */
  message: string;
  /** File path where the issue occurs */
  file?: string;
  /** Line number where the issue occurs */
  line?: number;
  /** Suggested fix (if applicable) */
  fix?: string;
  /** Additional context */
  context?: string;
}

export interface MissingVariable {
  /** Variable name that is missing */
  variable: string;
  /** Number of times the variable is used */
  usageCount: number;
  /** Files where the variable is used */
  files: string[];
  /** Import context if applicable */
  importContext?: string[];
}

export interface UnusedVariable {
  /** Variable name that is unused */
  variable: string;
  /** Number of times the variable is defined */
  definitionCount: number;
  /** Files where the variable is defined */
  files: string[];
}

export interface TypoIssue {
  /** Variable name with potential typo */
  variable: string;
  /** List of identified issues */
  issues: string[];
  /** Suggested corrections */
  suggestions?: string[];
}

export interface ValidationResult {
  /** Whether validation passed without errors */
  success: boolean;
  /** Array of validation issues found */
  issues: ValidationIssue[];
  /** Missing variable definitions */
  missingVariables: MissingVariable[];
  /** Unused variable definitions */
  unusedVariables: UnusedVariable[];
  /** Potential typos in variable names */
  typos: TypoIssue[];
  /** Summary statistics */
  summary: ValidationSummary;
  /** Processing metadata */
  metadata: ValidationMetadata;
}

export interface ValidationSummary {
  /** Total number of variable definitions */
  totalDefinitions: number;
  /** Number of direct definitions (not imported) */
  directDefinitions: number;
  /** Number of imported definitions */
  importedDefinitions: number;
  /** Total number of variable usages */
  totalUsage: number;
  /** Number of direct usages (not imported) */
  directUsage: number;
  /** Number of imported usages */
  importedUsage: number;
  /** Number of unique variables */
  uniqueVariables: number;
  /** Number of missing variables */
  missingVariables: number;
  /** Number of unused variables */
  unusedVariables: number;
  /** Number of potential typos */
  typos: number;
  /** Number of CSS files processed */
  cssFilesProcessed: number;
}

export interface ValidationMetadata {
  /** Start time of validation */
  startTime: Date;
  /** End time of validation */
  endTime: Date;
  /** Total validation duration in milliseconds */
  duration: number;
  /** Project root directory */
  projectRoot: string;
  /** Directories scanned */
  scanDirs: string[];
  /** Configuration used */
  config: ValidatorConfig;
}

export interface ValidatorConfig {
  /** Directories to scan for CSS files */
  scanDirs: string[];
  /** Critical variables that must be consistent */
  criticalVariables: string[];
  /** Theme-specific variables that should have different values per theme */
  themeVariables: string[];
  /** Enable verbose output */
  verbose?: boolean;
  /** Enable automatic fixing mode */
  fixMode?: boolean;
  /** Maximum number of files to process */
  maxFiles?: number;
  /** File patterns to include */
  includePatterns?: string[];
  /** File patterns to exclude */
  excludePatterns?: string[];
  /** Whether to fail on any inconsistencies (for CI/CD) */
  strict?: boolean;
}

export interface CSSFile {
  /** Full path to the CSS file */
  path: string;
  /** Base name of the CSS file */
  name: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  modified: Date;
  /** Whether the file is readable */
  readable: boolean;
  /** File content (if loaded) */
  content?: string;
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
  verbose(message: string): void;
}

export interface ReportOptions {
  /** Output format for the report */
  format: "markdown" | "json" | "text";
  /** Output file path */
  outputPath?: string;
  /** Include detailed information */
  detailed?: boolean;
  /** Include file paths in output */
  includePaths?: boolean;
  /** Include line numbers in output */
  includeLineNumbers?: boolean;
}

export interface FixOptions {
  /** Whether to create backups before fixing */
  createBackups?: boolean;
  /** Backup directory */
  backupDir?: string;
  /** Whether to apply fixes automatically */
  autoApply?: boolean;
  /** Dry run mode (show what would be fixed) */
  dryRun?: boolean;
}

export interface FixResult {
  /** Whether any fixes were applied */
  applied: boolean;
  /** Number of fixes applied */
  count: number;
  /** Array of applied fixes */
  fixes: AppliedFix[];
  /** Files that were modified */
  modifiedFiles: string[];
  /** Backup files created */
  backupFiles: string[];
}

export interface AppliedFix {
  /** Type of fix applied */
  type: "add_definition" | "remove_unused" | "fix_typo" | "fix_import";
  /** Variable name affected */
  variable: string;
  /** File that was modified */
  file: string;
  /** Line number where fix was applied */
  line: number;
  /** Description of the fix */
  description: string;
  /** Original content (if applicable) */
  original?: string;
  /** New content (if applicable) */
  replacement?: string;
}
