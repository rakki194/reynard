/**
 * 🦊 Validation Types
 * 
 * Type definitions for the unified Reynard validation system.
 */

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: ValidationSeverity;
  message: string;
  rule: string;
  source: string;
  suggestions?: string[];
  fix?: {
    range: [number, number];
    text: string;
  };
}

export interface ValidationContext {
  projectRoot: string;
  stagedFiles: string[];
  allFiles: string[];
  commitMessage?: string;
  branchName?: string;
  remoteName?: string;
  remoteUrl?: string;
  [key: string]: any;
}

export interface ValidationRule {
  name: string;
  type: "file-pattern" | "file-content" | "command" | "custom";
  enabled: boolean;
  pattern?: {
    glob: string[];
    required?: boolean;
    maxCount?: number;
    namingConvention?: "kebab-case" | "camelCase" | "PascalCase" | "snake_case";
  };
  content?: {
    patterns: Array<{
      glob: string[];
      checks: Array<{
        pattern: string;
        flags?: string;
        required?: boolean;
        forbidden?: boolean;
        maxOccurrences?: number;
        message?: string;
      }>;
    }>;
  };
  command?: {
    command: string;
    args: string[];
    cwd?: string;
    expectFailure?: boolean;
  };
  validator?: (context: ValidationContext) => Promise<ValidationIssue[]>;
}

export interface ValidationConfig {
  rules: {
    [key: string]: Partial<ValidationRule>;
  };
  options: {
    parallel: boolean;
    maxConcurrency: number;
    failFast: boolean;
    verbose: boolean;
  };
}

export interface ValidationResult {
  success: boolean;
  rules: Array<{
    name: string;
    success: boolean;
    issues: ValidationIssue[];
    duration: number;
    timestamp: Date;
  }>;
  issues: ValidationIssue[];
  summary: {
    totalRules: number;
    executedRules: number;
    passedRules: number;
    failedRules: number;
    totalIssues: number;
    errors: number;
    warnings: number;
    info: number;
  };
  duration: number;
  timestamp: Date;
  error?: string;
}

export interface FilePatternRule {
  name: string;
  glob: string[];
  required: boolean;
  maxCount?: number;
  minCount?: number;
  namingConvention?: string;
  excludePatterns?: string[];
}

export interface FileContentRule {
  name: string;
  glob: string[];
  checks: Array<{
    type: "regex" | "contains" | "not-contains" | "starts-with" | "ends-with";
    pattern: string;
    flags?: string;
    required?: boolean;
    forbidden?: boolean;
    maxOccurrences?: number;
    minOccurrences?: number;
    message?: string;
  }>;
}

export interface CommandRule {
  name: string;
  command: string;
  args: string[];
  cwd?: string;
  expectFailure?: boolean;
  timeout?: number;
  env?: Record<string, string>;
}

export interface CustomRule {
  name: string;
  validator: (context: ValidationContext) => Promise<ValidationIssue[]>;
  description?: string;
}

export interface ValidationPreset {
  name: string;
  description: string;
  rules: string[];
  config: Partial<ValidationConfig>;
}

export interface ValidationReport {
  timestamp: Date;
  projectRoot: string;
  results: ValidationResult;
  metadata: {
    version: string;
    nodeVersion: string;
    platform: string;
    duration: number;
  };
}

export interface ValidationCache {
  fileHashes: Map<string, string>;
  results: Map<string, ValidationResult>;
  lastRun: Date;
}

export interface ValidationStats {
  totalRuns: number;
  totalRules: number;
  totalIssues: number;
  averageDuration: number;
  successRate: number;
  mostCommonIssues: Array<{
    rule: string;
    count: number;
    severity: ValidationSeverity;
  }>;
  slowestRules: Array<{
    rule: string;
    duration: number;
  }>;
}
