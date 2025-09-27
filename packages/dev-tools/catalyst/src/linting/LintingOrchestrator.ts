/**
 * 🦊 Reynard Linting Orchestrator
 * 
 * Unified linting system that coordinates multiple linters and processors.
 * Replaces the fragmented linting systems across dev-tools packages.
 */

import { spawn, execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { ReynardLogger } from "../logger/ReynardLogger.js";
import type { LintingConfig, LintingResult, LintingProcessor, LintIssue, LintSeverity } from "../types/Linting.js";

export class LintingOrchestrator {
  private logger: ReynardLogger;
  private projectRoot: string;
  private config: LintingConfig;
  private processors: Map<string, LintingProcessor> = new Map();

  constructor(projectRoot: string = process.cwd(), config?: Partial<LintingConfig>, logger?: ReynardLogger) {
    this.projectRoot = resolve(projectRoot);
    this.logger = logger || new ReynardLogger();
    this.config = this.mergeConfig(config);
    this.initializeProcessors();
  }

  /**
   * Run linting on specified files or all files
   */
  async lint(files?: string[]): Promise<LintingResult> {
    const startTime = Date.now();
    this.logger.info("🦊 Starting unified linting process...");

    try {
      const targetFiles = files || await this.discoverFiles();
      const results: LintingResult = {
        success: true,
        files: [],
        issues: [],
        summary: {
          totalFiles: targetFiles.length,
          processedFiles: 0,
          totalIssues: 0,
          errors: 0,
          warnings: 0,
          info: 0
        },
        duration: 0,
        timestamp: new Date()
      };

      // Process files with appropriate linters
      for (const file of targetFiles) {
        const fileResult = await this.lintFile(file);
        results.files.push(fileResult);
        results.issues.push(...fileResult.issues);
        
        if (fileResult.issues.length > 0) {
          results.success = false;
        }
      }

      // Update summary
      results.summary.processedFiles = results.files.length;
      results.summary.totalIssues = results.issues.length;
      results.summary.errors = results.issues.filter(i => i.severity === "error").length;
      results.summary.warnings = results.issues.filter(i => i.severity === "warning").length;
      results.summary.info = results.issues.filter(i => i.severity === "info").length;
      results.duration = Date.now() - startTime;

      this.logLintingResults(results);
      return results;
    } catch (error) {
      this.logger.error(`❌ Linting failed: ${error}`);
      return {
        success: false,
        files: [],
        issues: [],
        summary: {
          totalFiles: 0,
          processedFiles: 0,
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
   * Run linting on a single file
   */
  private async lintFile(filePath: string): Promise<{ file: string; issues: LintIssue[]; success: boolean }> {
    const issues: LintIssue[] = [];
    const fileExtension = this.getFileExtension(filePath);
    const processor = this.getProcessorForFile(fileExtension);

    if (!processor) {
      this.logger.warn(`⚠️  No processor found for file: ${filePath}`);
      return { file: filePath, issues, success: true };
    }

    try {
      this.logger.verbose(`🔍 Linting ${filePath} with ${processor.name}...`);
      const result = await processor.lint(filePath, this.config);
      issues.push(...result.issues);
    } catch (error) {
      this.logger.error(`❌ Failed to lint ${filePath}: ${error}`);
      issues.push({
        file: filePath,
        line: 0,
        column: 0,
        severity: "error",
        message: `Linting failed: ${error}`,
        rule: "linting-error",
        source: processor.name
      });
    }

    return {
      file: filePath,
      issues,
      success: issues.filter(i => i.severity === "error").length === 0
    };
  }

  /**
   * Fix linting issues automatically
   */
  async fix(files?: string[]): Promise<LintingResult> {
    this.logger.info("🦊 Running automatic linting fixes...");

    const targetFiles = files || await this.discoverFiles();
    const results: LintingResult = {
      success: true,
      files: [],
      issues: [],
      summary: {
        totalFiles: targetFiles.length,
        processedFiles: 0,
        totalIssues: 0,
        errors: 0,
        warnings: 0,
        info: 0
      },
      duration: 0,
      timestamp: new Date()
    };

    for (const file of targetFiles) {
      const fileExtension = this.getFileExtension(file);
      const processor = this.getProcessorForFile(fileExtension);

      if (processor && processor.fix) {
        try {
          this.logger.verbose(`🔧 Fixing ${file}...`);
          await processor.fix(file, this.config);
        } catch (error) {
          this.logger.error(`❌ Failed to fix ${file}: ${error}`);
        }
      }
    }

    // Re-run linting to get updated results
    return await this.lint(files);
  }

  /**
   * Discover files to lint based on configuration
   */
  private async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    const { readdir, stat } = await import("fs/promises");
    const { join, extname } = await import("path");

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir);
        
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            // Skip excluded directories
            const shouldExclude = this.config.excludePatterns.some((pattern: string) => {
              const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
              return regex.test(fullPath);
            });
            
            if (!shouldExclude) {
              await scanDirectory(fullPath);
            }
          } else if (stats.isFile()) {
            const ext = extname(entry);
            const shouldInclude = this.config.includePatterns.some((pattern: string) => {
              const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
              return regex.test(fullPath);
            });
            
            if (shouldInclude) {
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
   * Get processor for file extension
   */
  private getProcessorForFile(extension: string): LintingProcessor | undefined {
    for (const processor of this.processors.values()) {
      if (processor.canProcess(extension)) {
        return processor;
      }
    }
    return undefined;
  }

  /**
   * Get file extension
   */
  private getFileExtension(filePath: string): string {
    const parts = filePath.split(".");
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
  }

  /**
   * Initialize linting processors
   */
  private initializeProcessors(): void {
    // ESLint processor for TypeScript/JavaScript
    this.processors.set("eslint", {
      name: "ESLint",
      canProcess: (ext) => [".ts", ".tsx", ".js", ".jsx"].includes(ext),
      lint: async (file, config) => this.runESLint(file, config),
      fix: async (file, config) => this.fixESLint(file, config)
    });

    // Prettier processor for formatting
    this.processors.set("prettier", {
      name: "Prettier",
      canProcess: (ext) => [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css", ".scss"].includes(ext),
      lint: async (file, config) => this.runPrettier(file, config),
      fix: async (file, config) => this.fixPrettier(file, config)
    });

    // Python linting (if available)
    this.processors.set("python", {
      name: "Python Linting",
      canProcess: (ext) => ext === ".py",
      lint: async (file, config) => this.runPythonLinting(file, config),
      fix: async (file, config) => this.fixPythonLinting(file, config)
    });
  }

  /**
   * Run ESLint on a file
   */
  private async runESLint(file: string, config: LintingConfig): Promise<{ issues: LintIssue[] }> {
    const issues: LintIssue[] = [];

    try {
      const result = execSync(`npx eslint "${file}" --format json`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      const eslintResults = JSON.parse(result);
      for (const result of eslintResults) {
        for (const message of result.messages) {
          issues.push({
            file: result.filePath,
            line: message.line,
            column: message.column,
            severity: this.mapESLintSeverity(message.severity),
            message: message.message,
            rule: message.ruleId || "unknown",
            source: "eslint"
          });
        }
      }
    } catch (error: any) {
      // ESLint returns non-zero exit code when issues are found
      if (error.stdout) {
        try {
          const eslintResults = JSON.parse(error.stdout);
          for (const result of eslintResults) {
            for (const message of result.messages) {
              issues.push({
                file: result.filePath,
                line: message.line,
                column: message.column,
                severity: this.mapESLintSeverity(message.severity),
                message: message.message,
                rule: message.ruleId || "unknown",
                source: "eslint"
              });
            }
          }
        } catch (parseError) {
          // If we can't parse the output, create a generic error
          issues.push({
            file,
            line: 0,
            column: 0,
            severity: "error",
            message: "ESLint failed to parse file",
            rule: "eslint-error",
            source: "eslint"
          });
        }
      }
    }

    return { issues };
  }

  /**
   * Fix ESLint issues
   */
  private async fixESLint(file: string, config: LintingConfig): Promise<void> {
    try {
      execSync(`npx eslint "${file}" --fix`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error) {
      // Fix command may still have issues that can't be auto-fixed
      this.logger.warn(`⚠️  ESLint fix completed with remaining issues for ${file}`);
    }
  }

  /**
   * Run Prettier on a file
   */
  private async runPrettier(file: string, config: LintingConfig): Promise<{ issues: LintIssue[] }> {
    const issues: LintIssue[] = [];

    try {
      execSync(`npx prettier --check "${file}"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error: any) {
      // Prettier returns non-zero when formatting issues are found
      issues.push({
        file,
        line: 0,
        column: 0,
        severity: "warning",
        message: "File is not formatted according to Prettier rules",
        rule: "prettier/prettier",
        source: "prettier"
      });
    }

    return { issues };
  }

  /**
   * Fix Prettier issues
   */
  private async fixPrettier(file: string, config: LintingConfig): Promise<void> {
    try {
      execSync(`npx prettier --write "${file}"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error) {
      this.logger.error(`❌ Failed to fix Prettier issues for ${file}: ${error}`);
    }
  }

  /**
   * Run Python linting
   */
  private async runPythonLinting(file: string, config: LintingConfig): Promise<{ issues: LintIssue[] }> {
    const issues: LintIssue[] = [];

    try {
      // Run flake8
      const result = execSync(`bash -c "source ~/venv/bin/activate && flake8 '${file}'"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error: any) {
      // Parse flake8 output
      const lines = error.stdout?.split("\n") || [];
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split(":");
          if (parts.length >= 4) {
            issues.push({
              file: parts[0],
              line: parseInt(parts[1]) || 0,
              column: parseInt(parts[2]) || 0,
              severity: "warning",
              message: parts.slice(3).join(":").trim(),
              rule: "flake8",
              source: "flake8"
            });
          }
        }
      }
    }

    return { issues };
  }

  /**
   * Fix Python linting issues
   */
  private async fixPythonLinting(file: string, config: LintingConfig): Promise<void> {
    try {
      // Run black for formatting
      execSync(`bash -c "source ~/venv/bin/activate && black '${file}'"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      // Run isort for import sorting
      execSync(`bash -c "source ~/venv/bin/activate && isort '${file}'"`, {
        cwd: this.projectRoot,
        encoding: "utf8"
      });
    } catch (error) {
      this.logger.error(`❌ Failed to fix Python linting issues for ${file}: ${error}`);
    }
  }

  /**
   * Map ESLint severity to our severity type
   */
  private mapESLintSeverity(severity: number): LintSeverity {
    switch (severity) {
      case 2: return "error";
      case 1: return "warning";
      default: return "info";
    }
  }

  /**
   * Log linting results
   */
  private logLintingResults(results: LintingResult): void {
    const { summary } = results;
    
    if (results.success) {
      this.logger.success(`✅ Linting completed successfully`);
    } else {
      this.logger.error(`❌ Linting completed with issues`);
    }

    this.logger.info(`📊 Summary: ${summary.processedFiles}/${summary.totalFiles} files processed`);
    this.logger.info(`📊 Issues: ${summary.errors} errors, ${summary.warnings} warnings, ${summary.info} info`);
    this.logger.info(`⏱️  Duration: ${results.duration}ms`);

    if (summary.errors > 0) {
      this.logger.error("🚨 Files with errors:");
      for (const file of results.files) {
        const errorCount = file.issues.filter(i => i.severity === "error").length;
        if (errorCount > 0) {
          this.logger.error(`  ${file.file}: ${errorCount} errors`);
        }
      }
    }
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config?: Partial<LintingConfig>): LintingConfig {
    const defaultConfig: LintingConfig = {
      includePatterns: [
        "**/*.ts",
        "**/*.tsx",
        "**/*.js",
        "**/*.jsx",
        "**/*.py"
      ],
      excludePatterns: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "**/third_party/**",
        "**/.git/**"
      ],
      processors: {
        eslint: { enabled: true, fix: true },
        prettier: { enabled: true, fix: true },
        python: { enabled: true, fix: true }
      },
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
      processors: {
        ...defaultConfig.processors,
        ...config?.processors
      },
      options: {
        ...defaultConfig.options,
        ...config?.options
      }
    };
  }
}
