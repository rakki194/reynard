/**
 * 🦊 Naming Violation Scanner
 *
 * Enforces critical naming guidelines across the Reynard codebase.
 * Scans for forbidden prefixes and suggests proper naming patterns.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { DEFAULT_NAMING_RULES, type NamingRuleConfig } from "./naming-rules.config";

export interface NamingViolation {
  file: string;
  line: number;
  column: number;
  violation: string;
  context: string;
  suggestion: string;
  severity: "error" | "warning";
  type: "class" | "function" | "variable" | "interface" | "type" | "enum" | "file" | "package";
}

export type NamingRule = NamingRuleConfig;

export interface ScanResult {
  violations: NamingViolation[];
  totalFiles: number;
  totalViolations: number;
  summary: {
    errors: number;
    warnings: number;
    byType: Record<string, number>;
  };
}

export class NamingViolationScanner {
  private rules: NamingRule[] = [];
  private fileExtensions: string[] = [".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".md"];
  private excludePatterns: string[] = [
    "node_modules",
    "dist",
    "build",
    ".git",
    "coverage",
    "__tests__",
    "test-",
    ".test.",
    ".spec.",
    "third_party",
  ];

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Load default rules from configuration
    this.rules = [...DEFAULT_NAMING_RULES];
  }

  /**
   * Add exclude patterns to skip during scanning
   */
  public addExcludePatterns(patterns: string[]): void {
    this.excludePatterns.push(...patterns);
  }

  /**
   * Scan a directory for naming violations
   */
  public async scanDirectory(directory: string): Promise<ScanResult> {
    const violations: NamingViolation[] = [];
    let totalFiles = 0;

    const files = this.getFilesRecursively(directory);

    for (const file of files) {
      totalFiles++;
      const fileViolations = await this.scanFile(file);
      violations.push(...fileViolations);
    }

    return this.generateReport(violations, totalFiles);
  }

  /**
   * Scan a single file for naming violations
   */
  public async scanFile(filePath: string): Promise<NamingViolation[]> {
    const violations: NamingViolation[] = [];

    try {
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      // Check filename itself
      const fileName = basename(filePath, extname(filePath));
      const fileNameViolations = this.checkNaming(fileName, filePath, 0, 0, "file");
      violations.push(...fileNameViolations);

      // Check package.json name field
      if (filePath.endsWith("package.json")) {
        const packageViolations = this.checkPackageJson(content, filePath);
        violations.push(...packageViolations);
      }

      // Check each line for violations
      lines.forEach((line, index) => {
        const lineViolations = this.checkLine(line, filePath, index + 1);
        violations.push(...lineViolations);
      });
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}: ${error}`);
    }

    return violations;
  }

  private checkPackageJson(content: string, filePath: string): NamingViolation[] {
    const violations: NamingViolation[] = [];

    try {
      const packageJson = JSON.parse(content);

      if (packageJson.name) {
        const nameViolations = this.checkNaming(packageJson.name, filePath, 0, 0, "package");
        violations.push(...nameViolations);
      }
    } catch (error) {
      // Invalid JSON, skip
    }

    return violations;
  }

  private checkLine(line: string, filePath: string, lineNumber: number): NamingViolation[] {
    const violations: NamingViolation[] = [];

    // Check for class declarations
    const classMatches = line.match(/(?:class|interface|type|enum)\s+([A-Z][a-zA-Z0-9]*)/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const name = match.split(/\s+/).pop()!;
        const type = match.startsWith("class")
          ? "class"
          : match.startsWith("interface")
            ? "interface"
            : match.startsWith("type")
              ? "type"
              : "enum";
        const nameViolations = this.checkNaming(name, filePath, lineNumber, line.indexOf(name), type);
        violations.push(...nameViolations);
      });
    }

    // Check for function declarations
    const functionMatches = line.match(/(?:function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const name = match.split(/\s+/).pop()!;
        const nameViolations = this.checkNaming(name, filePath, lineNumber, line.indexOf(name), "function");
        violations.push(...nameViolations);
      });
    }

    // Check for variable declarations
    const variableMatches = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (variableMatches) {
      variableMatches.forEach(match => {
        const name = match.split(/\s+/).pop()!;
        const nameViolations = this.checkNaming(name, filePath, lineNumber, line.indexOf(name), "variable");
        violations.push(...nameViolations);
      });
    }

    return violations;
  }

  private checkNaming(
    name: string,
    filePath: string,
    line: number,
    column: number,
    type: NamingViolation["type"]
  ): NamingViolation[] {
    const violations: NamingViolation[] = [];

    for (const rule of this.rules) {
      const match = name.match(rule.pattern)?.[0];
      if (match) {
        const trimmedMatch = match.trim();
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
        const normalizedMatch = normalize(trimmedMatch);
        const forbiddenPrefix = rule.forbidden.find(prefix => normalizedMatch.startsWith(normalize(prefix)));

        if (forbiddenPrefix || rule.forbidden.length === 0) {
          violations.push({
            file: filePath,
            line,
            column,
            violation: trimmedMatch,
            context: name,
            suggestion: this.generateSuggestion(name, trimmedMatch, rule),
            severity: rule.severity,
            type,
          });
        }
      }
    }

    return violations;
  }

  private generateSuggestion(originalName: string, violation: string, rule: NamingRule): string {
    if (rule.forbidden.length > 0) {
      // Remove forbidden prefix
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
      const forbiddenPrefix = rule.forbidden.find(prefix => normalize(violation).startsWith(normalize(prefix)));

      if (forbiddenPrefix) {
        const cleaned = violation.substring(forbiddenPrefix.length);
        return `Use "${cleaned}" instead of "${violation}"`;
      }
    }

    // Generic suggestions based on rule type
    switch (rule.description) {
      case "Forbidden marketing prefixes that add no technical value":
        const cleaned = originalName.replace(
          /^(Unified|Enhanced|Advanced|Super|Ultra|Mega|Ultimate|Comprehensive|Complete|Full-Featured|FullFeatured|Enterprise-Grade|EnterpriseGrade|Intelligent|Smart|AI-Powered|AIPowered|Next-Gen|NextGen|Revolutionary)/i,
          ""
        );
        return `Remove marketing prefix and use clear, descriptive naming like "${cleaned}"`;

      case "Overly complex naming with too many words":
        return `Simplify to 2-3 clear words, e.g., "${this.simplifyName(originalName)}"`;

      case "Generic naming patterns that lack specificity":
        return `Use specific names that explain purpose, e.g., "${this.makeSpecific(originalName)}"`;

      default:
        return rule.suggestion;
    }
  }

  private simplifyName(name: string): string {
    // Simple heuristic to reduce word count
    const words = name.match(/[A-Z][a-z]*/g) || [];
    if (words.length > 3) {
      return words.slice(0, 3).join("");
    }
    return name;
  }

  private makeSpecific(name: string): string {
    // Replace generic terms with more specific ones
    return name
      .replace(/Manager$/i, "Coordinator")
      .replace(/Handler$/i, "Processor")
      .replace(/Processor$/i, "Engine")
      .replace(/Controller$/i, "Manager")
      .replace(/Service$/i, "Provider")
      .replace(/Engine$/i, "Core")
      .replace(/System$/i, "Framework")
      .replace(/Framework$/i, "Library")
      .replace(/Platform$/i, "Environment")
      .replace(/Solution$/i, "Implementation");
  }

  private getFilesRecursively(directory: string): string[] {
    const files: string[] = [];

    try {
      const items = readdirSync(directory);

      for (const item of items) {
        const fullPath = join(directory, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          if (!this.shouldExcludeDirectory(item)) {
            files.push(...this.getFilesRecursively(fullPath));
          }
        } else if (stat.isFile()) {
          if (this.shouldIncludeFile(item)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${directory}: ${error}`);
    }

    return files;
  }

  private shouldExcludeDirectory(dirName: string): boolean {
    return this.excludePatterns.some(pattern => dirName.includes(pattern) || dirName.startsWith("."));
  }

  private shouldIncludeFile(fileName: string): boolean {
    const ext = extname(fileName);
    return this.fileExtensions.includes(ext);
  }

  private generateReport(violations: NamingViolation[], totalFiles: number): ScanResult {
    const summary = {
      errors: violations.filter(v => v.severity === "error").length,
      warnings: violations.filter(v => v.severity === "warning").length,
      byType: {} as Record<string, number>,
    };

    // Count by type
    violations.forEach(violation => {
      summary.byType[violation.type] = (summary.byType[violation.type] || 0) + 1;
    });

    return {
      violations,
      totalFiles,
      totalViolations: violations.length,
      summary,
    };
  }

  /**
   * Add custom naming rule
   */
  public addRule(rule: NamingRule): void {
    this.rules.push(rule);
  }

  /**
   * Get all current rules
   */
  public getRules(): NamingRule[] {
    return [...this.rules];
  }

  /**
   * Clear all rules
   */
  public clearRules(): void {
    this.rules = [];
  }
}
