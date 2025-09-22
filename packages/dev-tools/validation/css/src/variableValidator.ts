/**
 * 🦊 CSS Variable Validator
 * Validates CSS variables for consistency, usage, and correctness
 */

import type {
  ValidationResult,
  ValidationIssue,
  MissingVariable,
  UnusedVariable,
  TypoIssue,
  ValidationSummary,
  ValidationMetadata,
  CSSVariableDefinition,
  CSSVariableUsage,
  ValidatorConfig,
} from "./types.js";
import type { ReynardLogger } from "reynard-dev-tools-catalyst";
import { VariableExtractor } from "./variableExtractor.js";

export class VariableValidator {
  private logger: ReynardLogger;
  private config: ValidatorConfig;
  private extractor: VariableExtractor;

  constructor(config: ValidatorConfig, logger: ReynardLogger, extractor: VariableExtractor) {
    this.config = config;
    this.logger = logger;
    this.extractor = extractor;
  }

  /**
   * Validate CSS variables and return comprehensive results
   */
  validate(
    definitions: Map<string, CSSVariableDefinition[]>,
    usage: Map<string, CSSVariableUsage[]>,
    startTime: Date
  ): ValidationResult {
    this.logger.info("🔬 Analyzing CSS variables...");

    const issues: ValidationIssue[] = [];
    const missingVariables = this.findMissingVariables(definitions, usage);
    const unusedVariables = this.findUnusedVariables(definitions, usage);
    const typos = this.findTypos(definitions, usage);

    // Convert findings to validation issues
    for (const missing of missingVariables) {
      issues.push({
        type: "missing",
        severity: "error",
        variable: missing.variable,
        message: `Variable '--${missing.variable}' is used but not defined`,
        context: `Used in ${missing.usageCount} place${missing.usageCount !== 1 ? "s" : ""}`,
      });
    }

    for (const unused of unusedVariables) {
      issues.push({
        type: "unused",
        severity: "warning",
        variable: unused.variable,
        message: `Variable '--${unused.variable}' is defined but never used`,
        context: `Defined in ${unused.definitionCount} place${unused.definitionCount !== 1 ? "s" : ""}`,
      });
    }

    for (const typo of typos) {
      issues.push({
        type: "typo",
        severity: "warning",
        variable: typo.variable,
        message: `Potential typo in variable name '--${typo.variable}'`,
        context: typo.issues.join(", "),
        ...(typo.suggestions && { fix: typo.suggestions.join(" or ") }),
      });
    }

    const endTime = new Date();
    const summary = this.generateSummary(definitions, usage, missingVariables, unusedVariables, typos);
    const metadata = this.generateMetadata(startTime, endTime);

    const result: ValidationResult = {
      success: issues.filter(i => i.severity === "error").length === 0,
      issues,
      missingVariables,
      unusedVariables,
      typos,
      summary,
      metadata,
    };

    this.logger.validationResults({
      total: issues.length,
      errors: issues.filter(i => i.severity === "error").length,
      warnings: issues.filter(i => i.severity === "warning").length,
      success: result.success,
    });

    return result;
  }

  /**
   * Find variables that are used but not defined
   */
  private findMissingVariables(
    definitions: Map<string, CSSVariableDefinition[]>,
    usage: Map<string, CSSVariableUsage[]>
  ): MissingVariable[] {
    const missing: MissingVariable[] = [];

    for (const [varName, usages] of usage) {
      if (!definitions.has(varName)) {
        const files = [...new Set(usages.map(u => u.file))];
        const importContext = this.getImportContext(usages);

        missing.push({
          variable: varName,
          usageCount: usages.length,
          files,
          importContext,
        });
      }
    }

    return missing;
  }

  /**
   * Find variables that are defined but never used
   */
  private findUnusedVariables(
    definitions: Map<string, CSSVariableDefinition[]>,
    usage: Map<string, CSSVariableUsage[]>
  ): UnusedVariable[] {
    const unused: UnusedVariable[] = [];

    for (const [varName, defs] of definitions) {
      if (!usage.has(varName)) {
        // Skip some common variables that might be used by external tools
        if (this.extractor.isLikelyExternalVariable(varName)) continue;

        const files = [...new Set(defs.map(d => d.file))];

        unused.push({
          variable: varName,
          definitionCount: defs.length,
          files,
        });
      }
    }

    return unused;
  }

  /**
   * Find potential typos in variable names
   */
  private findTypos(
    definitions: Map<string, CSSVariableDefinition[]>,
    usage: Map<string, CSSVariableUsage[]>
  ): TypoIssue[] {
    const allVars = new Set([...definitions.keys(), ...usage.keys()]);
    const typos: TypoIssue[] = [];

    for (const varName of allVars) {
      const issues: string[] = [];
      const suggestions: string[] = [];

      // Check for common typos
      if (varName.includes("primay")) {
        issues.push("'primay' should be 'primary'");
        suggestions.push(varName.replace("primay", "primary"));
      }
      if (varName.includes("seconary")) {
        issues.push("'seconary' should be 'secondary'");
        suggestions.push(varName.replace("seconary", "secondary"));
      }
      if (varName.includes("tertiary") && !varName.includes("tertiary")) {
        issues.push("'tertiary' should be 'tertiary'");
        suggestions.push(varName.replace("tertiary", "tertiary"));
      }
      if (varName.includes("backgound")) {
        issues.push("'backgound' should be 'background'");
        suggestions.push(varName.replace("backgound", "background"));
      }
      if (varName.includes("forground")) {
        issues.push("'forground' should be 'foreground'");
        suggestions.push(varName.replace("forground", "foreground"));
      }
      if (varName.includes("borer")) {
        issues.push("'borer' should be 'border'");
        suggestions.push(varName.replace("borer", "border"));
      }

      if (issues.length > 0) {
        typos.push({
          variable: varName,
          issues,
          suggestions,
        });
      }
    }

    return typos;
  }

  /**
   * Get import context for missing variables
   */
  private getImportContext(usages: CSSVariableUsage[]): string[] {
    const importSources = new Set<string>();

    for (const usage of usages) {
      if (usage.importedFrom) {
        importSources.add(usage.importedFrom);
      }
    }

    return Array.from(importSources);
  }

  /**
   * Generate validation summary
   */
  private generateSummary(
    definitions: Map<string, CSSVariableDefinition[]>,
    usage: Map<string, CSSVariableUsage[]>,
    missingVariables: MissingVariable[],
    unusedVariables: UnusedVariable[],
    typos: TypoIssue[]
  ): ValidationSummary {
    const totalDefinitions = Array.from(definitions.values()).reduce((sum, defs) => sum + defs.length, 0);
    const totalUsage = Array.from(usage.values()).reduce((sum, usages) => sum + usages.length, 0);

    // Count imported variables
    const importedDefinitions = Array.from(definitions.values())
      .flat()
      .filter(def => def.importedFrom).length;
    const importedUsage = Array.from(usage.values())
      .flat()
      .filter(usage => usage.importedFrom).length;

    return {
      totalDefinitions,
      directDefinitions: totalDefinitions - importedDefinitions,
      importedDefinitions,
      totalUsage,
      directUsage: totalUsage - importedUsage,
      importedUsage,
      uniqueVariables: definitions.size,
      missingVariables: missingVariables.length,
      unusedVariables: unusedVariables.length,
      typos: typos.length,
      cssFilesProcessed: this.config.scanDirs.length, // This will be updated by the main validator
    };
  }

  /**
   * Generate validation metadata
   */
  private generateMetadata(startTime: Date, endTime: Date): ValidationMetadata {
    return {
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      projectRoot: process.cwd(),
      scanDirs: this.config.scanDirs,
      config: this.config,
    };
  }

  /**
   * Check if validation has errors
   */
  hasErrors(result: ValidationResult): boolean {
    return result.issues.some(issue => issue.severity === "error");
  }

  /**
   * Get exit code for CI/CD
   */
  getExitCode(result: ValidationResult): number {
    if (this.hasErrors(result)) return 1;
    if (result.issues.some(issue => issue.severity === "warning")) return 2;
    return 0;
  }
}
