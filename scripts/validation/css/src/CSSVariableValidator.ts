/**
 * 🦊 CSS Variable Validator - Main Class
 * Comprehensive CSS variable validation and analysis tool
 */

import type { ValidationResult, ValidatorConfig, ReportOptions } from "./types.js";
import { CSSLogger } from "./logger.js";
import { FileManager } from "./fileManager.js";
import { VariableExtractor } from "./variableExtractor.js";
import { VariableValidator } from "./variableValidator.js";
import { ReportGenerator } from "./reportGenerator.js";

export class CSSVariableValidator {
  private config: ValidatorConfig;
  private logger: CSSLogger;
  private fileManager: FileManager;
  private extractor: VariableExtractor;
  private validator: VariableValidator;
  private reportGenerator: ReportGenerator;

  constructor(config: Partial<ValidatorConfig> = {}) {
    // Default configuration
    this.config = {
      scanDirs: ["packages", "examples", "templates", "src", "styles"],
      criticalVariables: [
        "accent",
        "bg-color",
        "secondary-bg",
        "card-bg",
        "text-primary",
        "text-secondary",
        "text-tertiary",
        "border-color",
        "success",
        "error",
        "warning",
        "info",
        "danger",
      ],
      themeVariables: [
        "accent",
        "bg-color",
        "secondary-bg",
        "card-bg",
        "text-primary",
        "text-secondary",
        "border-color",
      ],
      verbose: false,
      fixMode: false,
      strict: false,
      ...config,
    };

    this.logger = new CSSLogger(this.config.verbose);
    this.fileManager = new FileManager(this.config, this.logger);
    this.extractor = new VariableExtractor(this.fileManager, this.logger);
    this.validator = new VariableValidator(this.config, this.logger, this.extractor);
    this.reportGenerator = new ReportGenerator(this.logger);
  }

  /**
   * Run the complete validation process
   */
  async validate(): Promise<ValidationResult> {
    const startTime = new Date();

    this.logger.header("🦊 CSS Variable Validator");
    this.logger.info("Starting CSS variable validation...");

    try {
      // Step 1: Find CSS files
      this.logger.info("🔍 Scanning for CSS files...");
      const cssFiles = this.fileManager.findCSSFiles();
      this.logger.info(`📁 Found ${cssFiles.length} CSS files`);

      if (cssFiles.length === 0) {
        this.logger.warn("No CSS files found in the project");
        return this.createEmptyResult(startTime);
      }

      // Step 2: Extract variables from all files
      this.logger.info("🔬 Extracting CSS variables...");
      const filePaths = cssFiles.map(f => f.path);
        const { definitions, usage } = this.extractor.extractFromFiles(filePaths);

      // Update summary with actual file count
      const summary = this.validator["generateSummary"](definitions, usage, [], [], []);
      summary.cssFilesProcessed = cssFiles.length;

      // Step 3: Validate variables
      this.logger.info("🔍 Validating CSS variables...");
      const result = this.validator.validate(definitions, usage, startTime);

      // Update the summary with the correct file count
      result.summary.cssFilesProcessed = cssFiles.length;

      // Step 4: Generate and display results
      this.displayResults(result);

      return result;
    } catch (error) {
      this.logger.error(`Validation failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Create an empty result for when no files are found
   */
  private createEmptyResult(startTime: Date): ValidationResult {
    const endTime = new Date();
    return {
      success: true,
      issues: [],
      missingVariables: [],
      unusedVariables: [],
      typos: [],
      summary: {
        totalDefinitions: 0,
        directDefinitions: 0,
        importedDefinitions: 0,
        totalUsage: 0,
        directUsage: 0,
        importedUsage: 0,
        uniqueVariables: 0,
        missingVariables: 0,
        unusedVariables: 0,
        typos: 0,
        cssFilesProcessed: 0,
      },
      metadata: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        projectRoot: this.fileManager.getProjectRoot(),
        scanDirs: this.config.scanDirs,
        config: this.config,
      },
    };
  }

  /**
   * Display validation results
   */
  private displayResults(result: ValidationResult): void {
    this.logger.section("📊 Validation Results");

    // Quick summary
    const quickSummary = this.reportGenerator.generateQuickSummary(result);
    this.logger.log(quickSummary);

    // Detailed statistics
    this.logger.summary({
      "CSS Files Processed": result.summary.cssFilesProcessed,
      "Unique Variables": result.summary.uniqueVariables,
      "Total Definitions": result.summary.totalDefinitions,
      "Total Usage": result.summary.totalUsage,
      "Missing Variables": result.summary.missingVariables,
      "Unused Variables": result.summary.unusedVariables,
      "Potential Typos": result.summary.typos,
    });

    // Show issues if any
    if (result.issues.length > 0) {
      this.logger.section("🚨 Issues Found");

      const errors = result.issues.filter(i => i.severity === "error");
      const warnings = result.issues.filter(i => i.severity === "warning");

      if (errors.length > 0) {
        this.logger.error(`Found ${errors.length} error${errors.length !== 1 ? "s" : ""}:`);
        for (const error of errors) {
          this.logger.error(`  --${error.variable}: ${error.message}`);
        }
      }

      if (warnings.length > 0) {
        this.logger.warn(`Found ${warnings.length} warning${warnings.length !== 1 ? "s" : ""}:`);
        for (const warning of warnings) {
          this.logger.warn(`  --${warning.variable}: ${warning.message}`);
        }
      }
    }

    // Final status
    if (result.success) {
      this.logger.success("🎉 All validations passed!");
    } else {
      this.logger.error("❌ Validation failed with errors");
    }
  }

  /**
   * Generate and save a detailed report
   */
  generateReport(result: ValidationResult, options: Partial<ReportOptions> = {}): string {
    const defaultOptions: ReportOptions = {
      format: "markdown",
      detailed: true,
      includePaths: true,
      includeLineNumbers: true,
      ...options,
    };

    return this.reportGenerator.generateReport(result, defaultOptions);
  }

  /**
   * Save report to file
   */
  saveReport(result: ValidationResult, outputPath: string, options: Partial<ReportOptions> = {}): boolean {
    const report = this.generateReport(result, options);
    return this.reportGenerator.saveReport(report, outputPath);
  }

  /**
   * Get the exit code for CI/CD
   */
  getExitCode(result: ValidationResult): number {
    return this.validator.getExitCode(result);
  }

  /**
   * Check if validation has errors
   */
  hasErrors(result: ValidationResult): boolean {
    return this.validator.hasErrors(result);
  }

  /**
   * Get current configuration
   */
  getConfig(): ValidatorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ValidatorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger = new CSSLogger(this.config.verbose);
    this.fileManager = new FileManager(this.config, this.logger);
    this.extractor = new VariableExtractor(this.fileManager, this.logger);
    this.validator = new VariableValidator(this.config, this.logger, this.extractor);
  }

  /**
   * Get logger instance
   */
  getLogger(): CSSLogger {
    return this.logger;
  }

  /**
   * Get file manager instance
   */
  getFileManager(): FileManager {
    return this.fileManager;
  }

  /**
   * Get variable extractor instance
   */
  getExtractor(): VariableExtractor {
    return this.extractor;
  }

  /**
   * Get variable validator instance
   */
  getValidator(): VariableValidator {
    return this.validator;
  }

  /**
   * Get report generator instance
   */
  getReportGenerator(): ReportGenerator {
    return this.reportGenerator;
  }
}
