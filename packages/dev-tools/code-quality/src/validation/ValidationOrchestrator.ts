/**
 * 🦊 Reynard Validation Orchestrator
 * 
 * Comprehensive validation system that consolidates all validation
 * functionality from the validation package into code-quality.
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { ReynardLogger } from "reynard-dev-tools-catalyst";
import { ValidationEngine } from "reynard-dev-tools-catalyst";
import type { ValidationConfig, ValidationResult, ValidationContext } from "reynard-dev-tools-catalyst";

export interface ValidationOrchestratorConfig {
  projectRoot?: string;
  validationRules?: ValidationConfig;
  pythonValidation?: {
    enabled: boolean;
    venvPath?: string;
    flake8Config?: string;
    blackConfig?: string;
    isortConfig?: string;
  };
  markdownValidation?: {
    enabled: boolean;
    rules: string[];
  };
  cssValidation?: {
    enabled: boolean;
    rules: string[];
  };
  workflowValidation?: {
    enabled: boolean;
    rules: string[];
  };
  shellValidation?: {
    enabled: boolean;
    rules: string[];
  };
}

export class ValidationOrchestrator {
  private logger: ReynardLogger;
  private projectRoot: string;
  private config: ValidationOrchestratorConfig;
  private validationEngine: ValidationEngine;

  constructor(config: ValidationOrchestratorConfig = {}, logger?: ReynardLogger) {
    this.projectRoot = resolve(config.projectRoot || process.cwd());
    this.logger = logger || new ReynardLogger();
    this.config = this.mergeConfig(config);
    this.validationEngine = new ValidationEngine(this.projectRoot, this.config.validationRules, this.logger);
  }

  /**
   * Run comprehensive validation across all supported types
   */
  async validateAll(context?: Partial<ValidationContext>): Promise<ValidationResult> {
    this.logger.info("🦊 Starting comprehensive validation...");

    const startTime = Date.now();
    const results: ValidationResult = {
      success: true,
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
      duration: 0,
      timestamp: new Date()
    };

    try {
      // Run core validation engine
      const coreResult = await this.validationEngine.validate(context);
      results.rules.push(...coreResult.rules);
      results.issues.push(...coreResult.issues);

      // Run Python validation
      if (this.config.pythonValidation?.enabled) {
        const pythonResult = await this.validatePython();
        results.rules.push(...pythonResult.rules);
        results.issues.push(...pythonResult.issues);
      }

      // Run Markdown validation
      if (this.config.markdownValidation?.enabled) {
        const markdownResult = await this.validateMarkdown();
        results.rules.push(...markdownResult.rules);
        results.issues.push(...markdownResult.issues);
      }

      // Run CSS validation
      if (this.config.cssValidation?.enabled) {
        const cssResult = await this.validateCSS();
        results.rules.push(...cssResult.rules);
        results.issues.push(...cssResult.issues);
      }

      // Run workflow validation
      if (this.config.workflowValidation?.enabled) {
        const workflowResult = await this.validateWorkflows();
        results.rules.push(...workflowResult.rules);
        results.issues.push(...workflowResult.issues);
      }

      // Run shell script validation
      if (this.config.shellValidation?.enabled) {
        const shellResult = await this.validateShellScripts();
        results.rules.push(...shellResult.rules);
        results.issues.push(...shellResult.issues);
      }

      // Update summary
      results.summary.totalRules = results.rules.length;
      results.summary.executedRules = results.rules.length;
      results.summary.passedRules = results.rules.filter(r => r.success).length;
      results.summary.failedRules = results.rules.filter(r => !r.success).length;
      results.summary.totalIssues = results.issues.length;
      results.summary.errors = results.issues.filter(i => i.severity === "error").length;
      results.summary.warnings = results.issues.filter(i => i.severity === "warning").length;
      results.summary.info = results.issues.filter(i => i.severity === "info").length;
      results.duration = Date.now() - startTime;
      results.success = results.summary.errors === 0;

      this.logValidationResults(results);
      return results;
    } catch (error) {
      this.logger.error(`❌ Validation failed: ${error}`);
      results.success = false;
      results.duration = Date.now() - startTime;
      results.error = error instanceof Error ? error.message : String(error);
      return results;
    }
  }

  /**
   * Validate Python files
   */
  private async validatePython(): Promise<ValidationResult> {
    this.logger.info("🐍 Validating Python files...");

    const result: ValidationResult = {
      success: true,
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
      duration: 0,
      timestamp: new Date()
    };

    try {
      const pythonFiles = await this.findPythonFiles();
      
      if (pythonFiles.length === 0) {
        this.logger.info("ℹ️  No Python files found");
        return result;
      }

      // Run flake8
      const flake8Result = await this.runFlake8(pythonFiles);
      result.rules.push(flake8Result);

      // Run black check
      const blackResult = await this.runBlackCheck(pythonFiles);
      result.rules.push(blackResult);

      // Run isort check
      const isortResult = await this.runIsortCheck(pythonFiles);
      result.rules.push(isortResult);

      // Update summary
      result.summary.totalRules = result.rules.length;
      result.summary.executedRules = result.rules.length;
      result.summary.passedRules = result.rules.filter((r: any) => r.success).length;
      result.summary.failedRules = result.rules.filter((r: any) => !r.success).length;
      result.summary.totalIssues = result.issues.length;
      result.summary.errors = result.issues.filter((i: any) => i.severity === "error").length;
      result.summary.warnings = result.issues.filter((i: any) => i.severity === "warning").length;
      result.summary.info = result.issues.filter((i: any) => i.severity === "info").length;
      result.success = result.summary.errors === 0;

      return result;
    } catch (error) {
      this.logger.error(`❌ Python validation failed: ${error}`);
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }

  /**
   * Validate Markdown files
   */
  private async validateMarkdown(): Promise<ValidationResult> {
    this.logger.info("📝 Validating Markdown files...");

    const result: ValidationResult = {
      success: true,
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
      duration: 0,
      timestamp: new Date()
    };

    try {
      const markdownFiles = await this.findMarkdownFiles();
      
      if (markdownFiles.length === 0) {
        this.logger.info("ℹ️  No Markdown files found");
        return result;
      }

      // Run markdownlint
      const markdownlintResult = await this.runMarkdownlint(markdownFiles);
      result.rules.push(markdownlintResult);

      // Update summary
      result.summary.totalRules = result.rules.length;
      result.summary.executedRules = result.rules.length;
      result.summary.passedRules = result.rules.filter((r: any) => r.success).length;
      result.summary.failedRules = result.rules.filter((r: any) => !r.success).length;
      result.summary.totalIssues = result.issues.length;
      result.summary.errors = result.issues.filter((i: any) => i.severity === "error").length;
      result.summary.warnings = result.issues.filter((i: any) => i.severity === "warning").length;
      result.summary.info = result.issues.filter((i: any) => i.severity === "info").length;
      result.success = result.summary.errors === 0;

      return result;
    } catch (error) {
      this.logger.error(`❌ Markdown validation failed: ${error}`);
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }

  /**
   * Validate CSS files
   */
  private async validateCSS(): Promise<ValidationResult> {
    this.logger.info("🎨 Validating CSS files...");

    const result: ValidationResult = {
      success: true,
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
      duration: 0,
      timestamp: new Date()
    };

    try {
      const cssFiles = await this.findCSSFiles();
      
      if (cssFiles.length === 0) {
        this.logger.info("ℹ️  No CSS files found");
        return result;
      }

      // Run stylelint
      const stylelintResult = await this.runStylelint(cssFiles);
      result.rules.push(stylelintResult);

      // Update summary
      result.summary.totalRules = result.rules.length;
      result.summary.executedRules = result.rules.length;
      result.summary.passedRules = result.rules.filter((r: any) => r.success).length;
      result.summary.failedRules = result.rules.filter((r: any) => !r.success).length;
      result.summary.totalIssues = result.issues.length;
      result.summary.errors = result.issues.filter((i: any) => i.severity === "error").length;
      result.summary.warnings = result.issues.filter((i: any) => i.severity === "warning").length;
      result.summary.info = result.issues.filter((i: any) => i.severity === "info").length;
      result.success = result.summary.errors === 0;

      return result;
    } catch (error) {
      this.logger.error(`❌ CSS validation failed: ${error}`);
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }

  /**
   * Validate GitHub workflows
   */
  private async validateWorkflows(): Promise<ValidationResult> {
    this.logger.info("⚙️  Validating GitHub workflows...");

    const result: ValidationResult = {
      success: true,
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
      duration: 0,
      timestamp: new Date()
    };

    try {
      const workflowFiles = await this.findWorkflowFiles();
      
      if (workflowFiles.length === 0) {
        this.logger.info("ℹ️  No workflow files found");
        return result;
      }

      // Run workflow validation
      const workflowValidationResult = await this.runWorkflowValidation(workflowFiles);
      result.rules.push(workflowValidationResult);

      // Update summary
      result.summary.totalRules = result.rules.length;
      result.summary.executedRules = result.rules.length;
      result.summary.passedRules = result.rules.filter((r: any) => r.success).length;
      result.summary.failedRules = result.rules.filter((r: any) => !r.success).length;
      result.summary.totalIssues = result.issues.length;
      result.summary.errors = result.issues.filter((i: any) => i.severity === "error").length;
      result.summary.warnings = result.issues.filter((i: any) => i.severity === "warning").length;
      result.summary.info = result.issues.filter((i: any) => i.severity === "info").length;
      result.success = result.summary.errors === 0;

      return result;
    } catch (error) {
      this.logger.error(`❌ Workflow validation failed: ${error}`);
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }

  /**
   * Validate shell scripts
   */
  private async validateShellScripts(): Promise<ValidationResult> {
    this.logger.info("🐚 Validating shell scripts...");

    const result: ValidationResult = {
      success: true,
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
      duration: 0,
      timestamp: new Date()
    };

    try {
      const shellFiles = await this.findShellScripts();
      
      if (shellFiles.length === 0) {
        this.logger.info("ℹ️  No shell scripts found");
        return result;
      }

      // Run shellcheck
      const shellcheckResult = await this.runShellcheck(shellFiles);
      result.rules.push(shellcheckResult);

      // Update summary
      result.summary.totalRules = result.rules.length;
      result.summary.executedRules = result.rules.length;
      result.summary.passedRules = result.rules.filter((r: any) => r.success).length;
      result.summary.failedRules = result.rules.filter((r: any) => !r.success).length;
      result.summary.totalIssues = result.issues.length;
      result.summary.errors = result.issues.filter((i: any) => i.severity === "error").length;
      result.summary.warnings = result.issues.filter((i: any) => i.severity === "warning").length;
      result.summary.info = result.issues.filter((i: any) => i.severity === "info").length;
      result.success = result.summary.errors === 0;

      return result;
    } catch (error) {
      this.logger.error(`❌ Shell script validation failed: ${error}`);
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }

  /**
   * Find Python files
   */
  private async findPythonFiles(): Promise<string[]> {
    return await this.findFilesByExtension([".py", ".pyi"]);
  }

  /**
   * Find Markdown files
   */
  private async findMarkdownFiles(): Promise<string[]> {
    return await this.findFilesByExtension([".md", ".markdown"]);
  }

  /**
   * Find CSS files
   */
  private async findCSSFiles(): Promise<string[]> {
    return await this.findFilesByExtension([".css", ".scss", ".sass", ".less"]);
  }

  /**
   * Find workflow files
   */
  private async findWorkflowFiles(): Promise<string[]> {
    const workflowDir = join(this.projectRoot, ".github", "workflows");
    if (!existsSync(workflowDir)) {
      return [];
    }

    return await this.findFilesByExtension([".yml", ".yaml"], workflowDir);
  }

  /**
   * Find shell scripts
   */
  private async findShellScripts(): Promise<string[]> {
    return await this.findFilesByExtension([".sh", ".bash", ".zsh", ".fish"]);
  }

  /**
   * Find files by extension
   */
  private async findFilesByExtension(extensions: string[], baseDir?: string): Promise<string[]> {
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
            await scanDirectory(fullPath);
          } else if (stats.isFile()) {
            const ext = extname(entry).toLowerCase();
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await scanDirectory(baseDir || this.projectRoot);
    return files;
  }

  /**
   * Run flake8 on Python files
   */
  private async runFlake8(files: string[]): Promise<{
    name: string;
    success: boolean;
    issues: any[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    
    try {
      const venvPath = this.config.pythonValidation?.venvPath || "~/venv";
      const command = `bash -c "source ${venvPath}/bin/activate && flake8 ${files.join(' ')}"`;
      
      execSync(command, { 
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      return {
        name: "flake8",
        success: true,
        issues: [],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: "flake8",
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "error",
          message: `Flake8 failed: ${error.message}`,
          rule: "flake8",
          source: "python-validator"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Run black check on Python files
   */
  private async runBlackCheck(files: string[]): Promise<{
    name: string;
    success: boolean;
    issues: any[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    
    try {
      const venvPath = this.config.pythonValidation?.venvPath || "~/venv";
      const command = `bash -c "source ${venvPath}/bin/activate && black --check ${files.join(' ')}"`;
      
      execSync(command, { 
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      return {
        name: "black",
        success: true,
        issues: [],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: "black",
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "warning",
          message: `Black formatting issues found: ${error.message}`,
          rule: "black",
          source: "python-validator"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Run isort check on Python files
   */
  private async runIsortCheck(files: string[]): Promise<{
    name: string;
    success: boolean;
    issues: any[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    
    try {
      const venvPath = this.config.pythonValidation?.venvPath || "~/venv";
      const command = `bash -c "source ${venvPath}/bin/activate && isort --check-only ${files.join(' ')}"`;
      
      execSync(command, { 
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      return {
        name: "isort",
        success: true,
        issues: [],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: "isort",
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "warning",
          message: `Import sorting issues found: ${error.message}`,
          rule: "isort",
          source: "python-validator"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Run markdownlint on Markdown files
   */
  private async runMarkdownlint(files: string[]): Promise<{
    name: string;
    success: boolean;
    issues: any[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    
    try {
      execSync(`npx markdownlint ${files.join(' ')}`, { 
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      return {
        name: "markdownlint",
        success: true,
        issues: [],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: "markdownlint",
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "warning",
          message: `Markdown linting issues found: ${error.message}`,
          rule: "markdownlint",
          source: "markdown-validator"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Run stylelint on CSS files
   */
  private async runStylelint(files: string[]): Promise<{
    name: string;
    success: boolean;
    issues: any[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    
    try {
      execSync(`npx stylelint ${files.join(' ')}`, { 
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      return {
        name: "stylelint",
        success: true,
        issues: [],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: "stylelint",
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "warning",
          message: `CSS linting issues found: ${error.message}`,
          rule: "stylelint",
          source: "css-validator"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Run workflow validation
   */
  private async runWorkflowValidation(files: string[]): Promise<{
    name: string;
    success: boolean;
    issues: any[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    const issues: any[] = [];

    try {
      for (const file of files) {
        const content = readFileSync(file, "utf8");
        
        // Basic YAML validation
        if (!content.trim()) {
          issues.push({
            file,
            line: 0,
            column: 0,
            severity: "error",
            message: "Workflow file is empty",
            rule: "workflow-empty",
            source: "workflow-validator"
          });
          continue;
        }

        // Check for required fields
        if (!content.includes("name:")) {
          issues.push({
            file,
            line: 0,
            column: 0,
            severity: "error",
            message: "Workflow missing required 'name' field",
            rule: "workflow-name",
            source: "workflow-validator"
          });
        }

        if (!content.includes("on:")) {
          issues.push({
            file,
            line: 0,
            column: 0,
            severity: "error",
            message: "Workflow missing required 'on' field",
            rule: "workflow-trigger",
            source: "workflow-validator"
          });
        }

        if (!content.includes("jobs:")) {
          issues.push({
            file,
            line: 0,
            column: 0,
            severity: "error",
            message: "Workflow missing required 'jobs' field",
            rule: "workflow-jobs",
            source: "workflow-validator"
          });
        }
      }

      return {
        name: "workflow-validation",
        success: issues.length === 0,
        issues,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: "workflow-validation",
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "error",
          message: `Workflow validation failed: ${error.message}`,
          rule: "workflow-validation",
          source: "workflow-validator"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Run shellcheck on shell scripts
   */
  private async runShellcheck(files: string[]): Promise<{
    name: string;
    success: boolean;
    issues: any[];
    duration: number;
    timestamp: Date;
  }> {
    const startTime = Date.now();
    
    try {
      execSync(`shellcheck ${files.join(' ')}`, { 
        cwd: this.projectRoot,
        encoding: "utf8"
      });

      return {
        name: "shellcheck",
        success: true,
        issues: [],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: "shellcheck",
        success: false,
        issues: [{
          file: "",
          line: 0,
          column: 0,
          severity: "warning",
          message: `Shell script issues found: ${error.message}`,
          rule: "shellcheck",
          source: "shell-validator"
        }],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
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
      for (const issue of results.issues.filter((i: any) => i.severity === "error")) {
        this.logger.error(`  ${issue.file}:${issue.line}:${issue.column} - ${issue.message}`);
      }
    }
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config: ValidationOrchestratorConfig): ValidationOrchestratorConfig {
    const defaultConfig: ValidationOrchestratorConfig = {
      projectRoot: process.cwd(),
      pythonValidation: {
        enabled: true,
        venvPath: "~/venv"
      } as any,
      markdownValidation: {
        enabled: true,
        rules: []
      } as any,
      cssValidation: {
        enabled: true,
        rules: []
      } as any,
      workflowValidation: {
        enabled: true,
        rules: []
      } as any,
      shellValidation: {
        enabled: true,
        rules: []
      } as any
    };

    return {
      ...defaultConfig,
      ...config,
      pythonValidation: {
        ...defaultConfig.pythonValidation,
        ...config.pythonValidation
      },
      markdownValidation: {
        ...defaultConfig.markdownValidation,
        ...config.markdownValidation
      },
      cssValidation: {
        ...defaultConfig.cssValidation,
        ...config.cssValidation
      },
      workflowValidation: {
        ...defaultConfig.workflowValidation,
        ...config.workflowValidation
      },
      shellValidation: {
        ...defaultConfig.shellValidation,
        ...config.shellValidation
      }
    };
  }
}
