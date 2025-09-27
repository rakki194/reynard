/**
 * 🦊 Reynard Validation Engine
 * 
 * Unified validation framework that consolidates all validation logic
 * from the fragmented validation packages into a cohesive system.
 */

import { execSync, spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { ReynardLogger } from "../logger/ReynardLogger.js";
import type { 
  ValidationConfig, 
  ValidationResult, 
  ValidationRule, 
  ValidationContext,
  ValidationIssue,
  ValidationSeverity 
} from "../types/Validation.js";

export class ValidationEngine {
  private logger: ReynardLogger;
  private projectRoot: string;
  private config: ValidationConfig;
  private rules: Map<string, ValidationRule> = new Map();

  constructor(projectRoot: string = process.cwd(), config?: Partial<ValidationConfig>, logger?: ReynardLogger) {
    this.projectRoot = resolve(projectRoot);
    this.logger = logger || new ReynardLogger();
    this.config = this.mergeConfig(config);
    this.initializeRules();
  }

  /**
   * Run all validation rules
   */
  async validate(context?: Partial<ValidationContext>): Promise<ValidationResult> {
    const startTime = Date.now();
    this.logger.info("🦊 Starting comprehensive validation...");

    const validationContext: ValidationContext = {
      projectRoot: this.projectRoot,
      stagedFiles: context?.stagedFiles || [],
      allFiles: context?.allFiles || [],
      commitMessage: context?.commitMessage,
      branchName: context?.branchName,
      ...context
    };

    try {
      const results: ValidationResult = {
        success: true,
        rules: [],
        issues: [],
        summary: {
          totalRules: this.rules.size,
          executedRules: 0,
          passedRules: 0,
          failedRules: 0,
          totalIssues: 0,
          errors: 0,
          warnings: 0,
          info: 0
        },
        duration: 0,
        timestamp: new Date()
      };

      // Execute each validation rule
      for (const [ruleName, rule] of this.rules) {
        if (rule.enabled) {
          try {
            this.logger.verbose(`🔍 Executing rule: ${ruleName}`);
            const ruleResult = await this.executeRule(ruleName, rule, validationContext);
            results.rules.push(ruleResult);
            results.issues.push(...ruleResult.issues);

            if (ruleResult.success) {
              results.summary.passedRules++;
            } else {
              results.summary.failedRules++;
              results.success = false;
            }

            results.summary.executedRules++;
          } catch (error) {
            this.logger.error(`❌ Rule ${ruleName} failed: ${error}`);
            results.rules.push({
              name: ruleName,
              success: false,
              issues: [{
                file: "",
                line: 0,
                column: 0,
                severity: "error",
                message: `Rule execution failed: ${error}`,
                rule: ruleName,
                source: "validation-engine"
              }],
              duration: 0,
              timestamp: new Date()
            });
            results.summary.failedRules++;
            results.success = false;
          }
        }
      }

      // Update summary
      results.summary.totalIssues = results.issues.length;
      results.summary.errors = results.issues.filter(i => i.severity === "error").length;
      results.summary.warnings = results.issues.filter(i => i.severity === "warning").length;
      results.summary.info = results.issues.filter(i => i.severity === "info").length;
      results.duration = Date.now() - startTime;

      this.logValidationResults(results);
      return results;
    } catch (error) {
      this.logger.error(`❌ Validation failed: ${error}`);
      return {
        success: false,
        rules: [],
        issues: [],
        summary: {
          totalRules: 0,
          executedRules: 0,
          passedRules: 0,
          failedRules: 0,
          totalIssues: 0,
          errors: 0,
          warnings: 0,
          info: 0
        },
        duration: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute a single validation rule
   */
  private async executeRule(ruleName: string, rule: ValidationRule, context: ValidationContext): Promise<{
    name: string;
    success: boolean;
    issues: ValidationIssue[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];

    try {
      switch (rule.type) {
        case "file-pattern":
          issues.push(...await this.validateFilePattern(rule, context));
          break;
        case "file-content":
          issues.push(...await this.validateFileContent(rule, context));
          break;
        case "command":
          issues.push(...await this.validateCommand(rule, context));
          break;
        case "custom":
          if (rule.validator) {
            issues.push(...await rule.validator(context));
          }
          break;
        default:
          throw new Error(`Unknown rule type: ${rule.type}`);
      }

      return {
        name: ruleName,
        success: issues.filter(i => i.severity === "error").length === 0,
        issues,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        name: ruleName,
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "error",
          message: `Rule execution failed: ${error}`,
          rule: ruleName,
          source: "validation-engine"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Validate file patterns (existence, naming, etc.)
   */
  private async validateFilePattern(rule: ValidationRule, context: ValidationContext): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const { glob } = rule.pattern!;

    for (const pattern of glob) {
      const files = await this.findFiles(pattern, context);
      
      if (rule.pattern!.required && files.length === 0) {
        issues.push({
          file: pattern,
          line: 0,
          column: 0,
          severity: "error",
          message: `Required file pattern not found: ${pattern}`,
          rule: rule.name,
          source: "file-pattern-validator"
        });
      }

      if (rule.pattern!.maxCount && files.length > rule.pattern!.maxCount) {
        issues.push({
          file: pattern,
          line: 0,
          column: 0,
          severity: "warning",
          message: `Too many files matching pattern: ${pattern} (${files.length} > ${rule.pattern!.maxCount})`,
          rule: rule.name,
          source: "file-pattern-validator"
        });
      }

      // Validate file naming conventions
      if (rule.pattern!.namingConvention) {
        for (const file of files) {
          if (!this.matchesNamingConvention(file, rule.pattern!.namingConvention!)) {
            issues.push({
              file,
              line: 0,
              column: 0,
              severity: "warning",
              message: `File does not match naming convention: ${rule.pattern!.namingConvention}`,
              rule: rule.name,
              source: "file-pattern-validator"
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validate file content
   */
  private async validateFileContent(rule: ValidationRule, context: ValidationContext): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const { patterns } = rule.content!;

    for (const pattern of patterns) {
      const files: string[] = [];
      for (const glob of pattern.glob) {
        const globFiles = await this.findFiles(glob, context);
        files.push(...globFiles);
      }
      
      for (const file of files) {
        try {
          const content = readFileSync(file, "utf8");
          
          for (const check of pattern.checks) {
            const regex = new RegExp(check.pattern, check.flags || "g");
            const matches = content.match(regex);
            
            if (check.required && (!matches || matches.length === 0)) {
              issues.push({
                file,
                line: 0,
                column: 0,
                severity: "error",
                message: `Required pattern not found: ${check.pattern}`,
                rule: rule.name,
                source: "file-content-validator"
              });
            }

            if (check.forbidden && matches && matches.length > 0) {
              issues.push({
                file,
                line: 0,
                column: 0,
                severity: "error",
                message: `Forbidden pattern found: ${check.pattern}`,
                rule: rule.name,
                source: "file-content-validator"
              });
            }

            if (check.maxOccurrences && matches && matches.length > check.maxOccurrences) {
              issues.push({
                file,
                line: 0,
                column: 0,
                severity: "warning",
                message: `Pattern occurs too many times: ${check.pattern} (${matches.length} > ${check.maxOccurrences})`,
                rule: rule.name,
                source: "file-content-validator"
              });
            }
          }
        } catch (error) {
          issues.push({
            file,
            line: 0,
            column: 0,
            severity: "error",
            message: `Failed to read file: ${error}`,
            rule: rule.name,
            source: "file-content-validator"
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate using external commands
   */
  private async validateCommand(rule: ValidationRule, context: ValidationContext): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const { command, args, cwd } = rule.command!;

    try {
      const result = execSync(`${command} ${args.join(" ")}`, {
        cwd: cwd || this.projectRoot,
        encoding: "utf8"
      });

      // Command succeeded
      if (rule.command!.expectFailure) {
        issues.push({
          file: "",
          line: 0,
          column: 0,
          severity: "error",
          message: `Command should have failed but succeeded: ${command}`,
          rule: rule.name,
          source: "command-validator"
        });
      }
    } catch (error: any) {
      // Command failed
      if (!rule.command!.expectFailure) {
        issues.push({
          file: "",
          line: 0,
          column: 0,
          severity: "error",
          message: `Command failed: ${command} - ${error.message}`,
          rule: rule.name,
          source: "command-validator"
        });
      }
    }

    return issues;
  }

  /**
   * Find files matching a glob pattern
   */
  private async findFiles(pattern: string, context: ValidationContext): Promise<string[]> {
    const files: string[] = [];
    const { readdir, stat } = await import("fs/promises");
    const { join } = await import("path");

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir);
        
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (stats.isFile()) {
            if (this.matchesGlob(fullPath, pattern)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await scanDirectory(this.projectRoot);
    return files;
  }

  /**
   * Check if file matches glob pattern
   */
  private matchesGlob(filePath: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
    return regex.test(filePath);
  }

  /**
   * Check if file matches naming convention
   */
  private matchesNamingConvention(filePath: string, convention: string): boolean {
    const fileName = filePath.split("/").pop() || "";
    
    switch (convention) {
      case "kebab-case":
        return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(fileName);
      case "camelCase":
        return /^[a-z][a-zA-Z0-9]*$/.test(fileName);
      case "PascalCase":
        return /^[A-Z][a-zA-Z0-9]*$/.test(fileName);
      case "snake_case":
        return /^[a-z0-9]+(_[a-z0-9]+)*$/.test(fileName);
      default:
        return true;
    }
  }

  /**
   * Initialize default validation rules
   */
  private initializeRules(): void {
    // TypeScript configuration validation
    this.rules.set("tsconfig-exists", {
      name: "TypeScript Configuration",
      type: "file-pattern",
      enabled: true,
      pattern: {
        glob: ["tsconfig.json", "tsconfig.*.json"],
        required: true,
        maxCount: 5
      }
    });

    // Package.json validation
    this.rules.set("package-json-exists", {
      name: "Package.json Exists",
      type: "file-pattern",
      enabled: true,
      pattern: {
        glob: ["package.json"],
        required: true,
        maxCount: 1
      }
    });

    // ESLint configuration validation
    this.rules.set("eslint-config-exists", {
      name: "ESLint Configuration",
      type: "file-pattern",
      enabled: true,
      pattern: {
        glob: [".eslintrc.*", "eslint.config.*"],
        required: true,
        maxCount: 1
      }
    });

    // No console.log in production code
    this.rules.set("no-console-logs", {
      name: "No Console Logs",
      type: "file-content",
      enabled: true,
      content: {
        patterns: [{
          glob: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
          checks: [{
            pattern: "console\\.(log|warn|error|info|debug)",
            forbidden: true,
            message: "Console statements should not be used in production code"
          }]
        }]
      }
    });

    // No TODO comments in production
    this.rules.set("no-todo-comments", {
      name: "No TODO Comments",
      type: "file-content",
      enabled: true,
      content: {
        patterns: [{
          glob: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
          checks: [{
            pattern: "TODO|FIXME|HACK|XXX",
            forbidden: true,
            message: "TODO comments should be resolved before production"
          }]
        }]
      }
    });

    // TypeScript compilation check
    this.rules.set("typescript-compiles", {
      name: "TypeScript Compilation",
      type: "command",
      enabled: true,
      command: {
        command: "npx",
        args: ["tsc", "--noEmit"],
        cwd: this.projectRoot
      }
    });

    // ESLint check
    this.rules.set("eslint-passes", {
      name: "ESLint Validation",
      type: "command",
      enabled: true,
      command: {
        command: "npx",
        args: ["eslint", ".", "--ext", ".ts,.tsx,.js,.jsx"],
        cwd: this.projectRoot
      }
    });
  }

  /**
   * Log validation results
   */
  private logValidationResults(results: ValidationResult): void {
    const { summary } = results;
    
    if (results.success) {
      this.logger.success(`✅ Validation completed successfully`);
    } else {
      this.logger.error(`❌ Validation completed with issues`);
    }

    this.logger.info(`📊 Summary: ${summary.passedRules}/${summary.executedRules} rules passed`);
    this.logger.info(`📊 Issues: ${summary.errors} errors, ${summary.warnings} warnings, ${summary.info} info`);
    this.logger.info(`⏱️  Duration: ${results.duration}ms`);

    if (summary.errors > 0) {
      this.logger.error("🚨 Validation errors:");
      for (const issue of results.issues.filter(i => i.severity === "error")) {
        this.logger.error(`  ${issue.file}:${issue.line}:${issue.column} - ${issue.message}`);
      }
    }
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config?: Partial<ValidationConfig>): ValidationConfig {
    const defaultConfig: ValidationConfig = {
      rules: {},
      options: {
        parallel: true,
        maxConcurrency: 4,
        failFast: false,
        verbose: false
      }
    };

    return {
      ...defaultConfig,
      ...config,
      options: {
        ...defaultConfig.options,
        ...config?.options
      }
    };
  }
}
