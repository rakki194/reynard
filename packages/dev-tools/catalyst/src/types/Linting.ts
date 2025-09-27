/**
 * 🦊 Linting Types
 * 
 * Type definitions for the unified Reynard linting system.
 */

export type LintSeverity = "error" | "warning" | "info" | "hint";

export interface LintIssue {
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: LintSeverity;
  message: string;
  rule: string;
  source: string;
  suggestions?: string[];
  fix?: {
    range: [number, number];
    text: string;
  };
}

export interface LintingProcessor {
  name: string;
  canProcess: (fileExtension: string) => boolean;
  lint: (file: string, config: LintingConfig) => Promise<{ issues: LintIssue[] }>;
  fix?: (file: string, config: LintingConfig) => Promise<void>;
}

export interface ProcessorConfig {
  enabled: boolean;
  fix?: boolean;
  options?: Record<string, any>;
}

export interface LintingConfig {
  includePatterns: string[];
  excludePatterns: string[];
  processors: {
    eslint?: ProcessorConfig;
    prettier?: ProcessorConfig;
    python?: ProcessorConfig;
    [key: string]: ProcessorConfig | undefined;
  };
  options: {
    parallel: boolean;
    maxConcurrency: number;
    failFast: boolean;
    verbose: boolean;
  };
}

export interface LintingResult {
  success: boolean;
  files: Array<{
    file: string;
    issues: LintIssue[];
    success: boolean;
  }>;
  issues: LintIssue[];
  summary: {
    totalFiles: number;
    processedFiles: number;
    totalIssues: number;
    errors: number;
    warnings: number;
    info: number;
  };
  duration: number;
  timestamp: Date;
  error?: string;
}

export interface ESLintConfig {
  extends?: string[];
  parser?: string;
  parserOptions?: Record<string, any>;
  plugins?: string[];
  rules?: Record<string, any>;
  env?: Record<string, boolean>;
  globals?: Record<string, string>;
  overrides?: Array<{
    files: string[];
    rules?: Record<string, any>;
    env?: Record<string, boolean>;
  }>;
  ignorePatterns?: string[];
}

export interface PrettierConfig {
  semi?: boolean;
  singleQuote?: boolean;
  tabWidth?: number;
  trailingComma?: "none" | "es5" | "all";
  printWidth?: number;
  useTabs?: boolean;
  bracketSpacing?: boolean;
  arrowParens?: "avoid" | "always";
  endOfLine?: "lf" | "crlf" | "cr" | "auto";
  plugins?: string[];
}

export interface PythonLintingConfig {
  flake8?: {
    enabled: boolean;
    config?: string;
    maxLineLength?: number;
    ignore?: string[];
  };
  black?: {
    enabled: boolean;
    lineLength?: number;
    targetVersion?: string[];
  };
  isort?: {
    enabled: boolean;
    profile?: string;
    lineLength?: number;
  };
  mypy?: {
    enabled: boolean;
    strict?: boolean;
    config?: string;
  };
}

export interface LintingCache {
  fileHashes: Map<string, string>;
  results: Map<string, LintingResult>;
  lastRun: Date;
}

export interface LintingStats {
  totalRuns: number;
  totalFiles: number;
  totalIssues: number;
  averageDuration: number;
  successRate: number;
  mostCommonIssues: Array<{
    rule: string;
    count: number;
    severity: LintSeverity;
  }>;
  slowestFiles: Array<{
    file: string;
    duration: number;
  }>;
}
