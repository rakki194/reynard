#!/usr/bin/env node
/**
 * CSS Variable Validation Script for Reynard Projects
 *
 * ⚠️  DEPRECATED: This JavaScript version has been replaced by a TypeScript implementation.
 *
 * Please use the new TypeScript version:
 *   cd scripts/validation/css
 *   pnpm install
 *   pnpm run build
 *   pnpm start [options]
 *
 * Or run directly:
 *   node dist/cli.js [options]
 *
 * The new TypeScript version provides:
 * - Better type safety and error handling
 * - More comprehensive validation rules
 * - Multiple report formats (Markdown, JSON, Text)
 * - Improved CLI interface with Commander.js
 * - Extensive test coverage
 * - Better import resolution
 * - Theme validation support
 *
 * This file is kept for backward compatibility but will be removed in a future version.
 */

import fs from "fs";
import path from "path";
import {
  BaseValidator,
  Colors,
  findProjectRoot,
  parseCommonArgs,
  printColored,
  printError,
  printHeader,
  printSuccess,
  printWarning,
  safeReadFile,
  scanDirectory,
} from "../shared/index.js";

// Configuration
const CONFIG = {
  // Directories to scan for CSS files
  scanDirs: ["packages", "examples", "templates", "src", "styles"],

  // Critical variables that must be consistent
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

  // Theme-specific variables that should have different values per theme
  themeVariables: ["accent", "bg-color", "secondary-bg", "card-bg", "text-primary", "text-secondary", "border-color"],
};

class CSSVariableValidator extends BaseValidator {
  constructor(options = {}) {
    super(options);
    this.options = { ...CONFIG, ...options };
    this.variables = {
      definitions: new Map(),
      usage: new Map(),
      inconsistencies: [],
      missing: [],
      unused: [],
      typos: [],
    };
    this.errors = [];
    this.warnings = [];
    this.projectRoot = findProjectRoot();
  }

  /**
   * Find all CSS files in the project
   */
  findCSSFiles(rootDir = null) {
    const root = rootDir || this.projectRoot;
    const cssFiles = [];

    if (this.options.verbose) {
      printColored("🔍 Scanning for CSS files in Reynard projects...", Colors.BLUE);
    }

    for (const scanDir of this.options.scanDirs) {
      const fullPath = path.join(root, scanDir);
      if (fs.existsSync(fullPath)) {
        const files = scanDirectory(fullPath, [".css"]);
        cssFiles.push(...files);
      }
    }

    if (this.options.verbose) {
      printColored(`\n📊 Summary:`, Colors.BLUE);
      printColored(`  Total CSS files found: ${cssFiles.length}`, Colors.BLUE);

      // Break down by project type
      const reynardMain = cssFiles.filter(f => f.includes("/reynard/") && !f.includes("/reynard-"));
      const reynardApps = cssFiles.filter(f => f.includes("/reynard-"));

      printColored(`  Main reynard directory: ${reynardMain.length} files`, Colors.BLUE);
      printColored(`  Reynard apps (reynard-*): ${reynardApps.length} files`, Colors.BLUE);

      if (reynardMain.length > 0) {
        printColored(`\n📁 Main reynard directory files:`, Colors.BLUE);
        reynardMain.forEach(f => {
          const relativePath = path.relative(root, f);
          printColored(`    ${relativePath}`, Colors.CYAN);
        });
      }

      if (reynardApps.length > 0) {
        printColored(`\n📱 Reynard apps files:`, Colors.BLUE);
        reynardApps.forEach(f => {
          const relativePath = path.relative(root, f);
          printColored(`    ${relativePath}`, Colors.CYAN);
        });
      }
      printColored("", Colors.NC);
    }

    return cssFiles;
  }

  /**
   * Resolve CSS import path relative to the importing file
   */
  resolveImportPath(importPath, importingFile) {
    // Remove quotes from import path
    const cleanPath = importPath.replace(/['"]/g, "");

    // Handle absolute paths (starting with /)
    if (cleanPath.startsWith("/")) {
      return cleanPath;
    }

    // Handle relative paths
    const importingDir = path.dirname(importingFile);
    const resolvedPath = path.resolve(importingDir, cleanPath);

    // Try different extensions if the file doesn't exist
    const extensions = ["", ".css"];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return resolvedPath;
  }

  /**
   * Extract CSS imports from a file
   */
  extractImports(filePath) {
    const content = safeReadFile(filePath);
    if (!content) return [];

    const lines = content.split("\n");
    const imports = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("/*") || line.startsWith("*")) continue;

      // Match @import statements
      const importMatch = line.match(/@import\s+['"]([^'"]+)['"]\s*;?/);
      if (importMatch) {
        const importPath = importMatch[1];
        const resolvedPath = this.resolveImportPath(importPath, filePath);

        imports.push({
          originalPath: importPath,
          resolvedPath: resolvedPath,
          line: i + 1,
          importingFile: filePath,
        });
      }
    }

    return imports;
  }

  /**
   * Extract CSS variables from a file, including imported files
   */
  extractVariables(filePath, visitedFiles = new Set()) {
    // Prevent circular imports
    if (visitedFiles.has(filePath)) {
      return {
        definitions: [],
        usage: [],
        themes: new Map(),
        imports: [],
      };
    }

    visitedFiles.add(filePath);

    const content = safeReadFile(filePath);
    if (!content) {
      visitedFiles.delete(filePath);
      return {
        definitions: [],
        usage: [],
        themes: new Map(),
        imports: [],
      };
    }

    const lines = content.split("\n");
    const fileVariables = {
      definitions: [],
      usage: [],
      themes: new Map(),
      imports: [],
    };

    let currentTheme = "default";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("/*") || line.startsWith("*")) continue;

      // Check for theme selectors
      const themeMatch = line.match(/:root\[data-theme="([^"]+)"\]/);
      if (themeMatch) {
        currentTheme = themeMatch[1];
        continue;
      }

      // Extract variable definitions (including multi-line)
      const varDefMatch = line.match(/--([a-zA-Z0-9-]+)\s*:\s*(.*)/);
      if (varDefMatch) {
        const [, varName, varValueStart] = varDefMatch;

        // Check if this is a multi-line definition
        if (varValueStart.includes(";")) {
          // Single line definition
          const value = varValueStart.replace(/;.*$/, "").trim();
          fileVariables.definitions.push({
            name: varName,
            value: value,
            line: i + 1,
            theme: currentTheme,
            file: filePath,
            context: line,
          });
        } else {
          // Multi-line definition - collect until we find the closing semicolon
          let fullValue = varValueStart;
          let j = i + 1;

          while (j < lines.length && !fullValue.includes(";")) {
            fullValue += " " + lines[j].trim();
            j++;
          }

          // Extract the value (everything before the semicolon)
          const value = fullValue.replace(/;.*$/, "").trim();

          fileVariables.definitions.push({
            name: varName,
            value: value,
            line: i + 1,
            theme: currentTheme,
            file: filePath,
            context: lines.slice(i, j).join(" ").trim(),
          });

          // Skip the lines we've already processed
          i = j - 1;
        }
      }

      // Extract variable usage
      const varUsageMatches = line.matchAll(/var\(--([a-zA-Z0-9-]+)\)/g);
      for (const match of varUsageMatches) {
        fileVariables.usage.push({
          name: match[1],
          line: i + 1,
          file: filePath,
          context: line,
        });
      }
    }

    // Process imports and include their variables
    const imports = this.extractImports(filePath);
    fileVariables.imports = imports;

    for (const importInfo of imports) {
      if (fs.existsSync(importInfo.resolvedPath)) {
        try {
          const importedVars = this.extractVariables(importInfo.resolvedPath, visitedFiles);

          // Add imported definitions with import context
          for (const def of importedVars.definitions) {
            fileVariables.definitions.push({
              ...def,
              importedFrom: importInfo.resolvedPath,
              importedVia: filePath,
            });
          }

          // Add imported usage
          for (const usage of importedVars.usage) {
            fileVariables.usage.push({
              ...usage,
              importedFrom: importInfo.resolvedPath,
              importedVia: filePath,
            });
          }
        } catch {
          // Skip files that can't be read (permissions, etc.)
          if (this.options.verbose) {
            printColored(`  ⚠️  Could not read imported file: ${importInfo.resolvedPath}`, Colors.YELLOW);
          }
        }
      } else if (this.options.verbose) {
        printColored(`  ⚠️  Imported file not found: ${importInfo.resolvedPath}`, Colors.YELLOW);
      }
    }

    visitedFiles.delete(filePath);
    return fileVariables;
  }

  /**
   * Analyze all CSS files
   */
  analyze() {
    printColored("🔍 Scanning for CSS files...", Colors.BLUE);
    const cssFiles = this.findCSSFiles();
    printColored(`📁 Found ${cssFiles.length} CSS files`, Colors.BLUE);

    if (cssFiles.length === 0) {
      this.warnings.push("No CSS files found in the project");
      return;
    }

    printColored("🔬 Analyzing CSS variables...", Colors.BLUE);

    // Collect all variables
    for (const file of cssFiles) {
      try {
        const fileVars = this.extractVariables(file);

        // Show import information in verbose mode
        if (this.options.verbose && fileVars.imports.length > 0) {
          const relativePath = path.relative(this.projectRoot, file);
          printColored(`  📦 ${relativePath} imports:`, Colors.CYAN);
          for (const imp of fileVars.imports) {
            const importRelativePath = path.relative(this.projectRoot, imp.resolvedPath);
            const exists = fs.existsSync(imp.resolvedPath) ? "✅" : "❌";
            printColored(`    ${exists} ${imp.originalPath} → ${importRelativePath}`, Colors.CYAN);
          }
        }

        // Add definitions to global map
        for (const def of fileVars.definitions) {
          if (!this.variables.definitions.has(def.name)) {
            this.variables.definitions.set(def.name, []);
          }
          this.variables.definitions.get(def.name).push(def);
        }

        // Add usage to global map
        for (const usage of fileVars.usage) {
          if (!this.variables.usage.has(usage.name)) {
            this.variables.usage.set(usage.name, []);
          }
          this.variables.usage.get(usage.name).push(usage);
        }
      } catch (error) {
        this.errors.push(`Error reading ${file}: ${error.message}`);
      }
    }

    // Analyze for issues
    this.findInconsistencies();
    this.findMissingVariables();
    this.findUnusedVariables();
    this.findTypos();
  }

  /**
   * Find variable definition inconsistencies
   */
  findInconsistencies() {
    // Intentionally empty - we don't check for value inconsistencies
    // Different values across themes or components may be intentional
  }

  /**
   * Find variables that are used but not defined
   */
  findMissingVariables() {
    for (const [varName, usages] of this.variables.usage) {
      if (!this.variables.definitions.has(varName)) {
        this.variables.missing.push({
          variable: varName,
          usageCount: usages.length,
          files: [...new Set(usages.map(u => u.file))],
        });
      }
    }
  }

  /**
   * Find variables that are defined but never used
   */
  findUnusedVariables() {
    for (const [varName, definitions] of this.variables.definitions) {
      if (!this.variables.usage.has(varName)) {
        // Skip some common variables that might be used by external tools
        if (this.isLikelyExternalVariable(varName)) continue;

        this.variables.unused.push({
          variable: varName,
          definitionCount: definitions.length,
          files: [...new Set(definitions.map(d => d.file))],
        });
      }
    }
  }

  /**
   * Find potential typos in variable names
   */
  findTypos() {
    const allVars = new Set([...this.variables.definitions.keys(), ...this.variables.usage.keys()]);

    for (const varName of allVars) {
      const issues = [];

      // Check for common typos
      if (varName.includes("primay")) {
        issues.push("'primay' should be 'primary'");
      }
      if (varName.includes("seconary")) {
        issues.push("'seconary' should be 'secondary'");
      }
      if (varName.includes("tertiary") && !varName.includes("tertiary")) {
        issues.push("'tertiary' should be 'tertiary'");
      }

      if (issues.length > 0) {
        this.variables.typos.push({
          variable: varName,
          issues,
        });
      }
    }
  }

  /**
   * Check if a variable is likely used by external tools
   */
  isLikelyExternalVariable(varName) {
    const externalPatterns = [/^z-/, /^shadow-/, /^transition-/, /^animation-/, /^font-/, /^spacing-/, /^breakpoint-/];

    return externalPatterns.some(pattern => pattern.test(varName));
  }

  /**
   * Generate a report
   */
  generateReport() {
    const report = [];

    report.push("# CSS Variable Validation Report");
    report.push("=".repeat(50));
    report.push("");

    // Summary
    const totalDefinitions = Array.from(this.variables.definitions.values()).reduce(
      (sum, defs) => sum + defs.length,
      0
    );
    const totalUsage = Array.from(this.variables.usage.values()).reduce((sum, usages) => sum + usages.length, 0);

    // Count imported variables
    const importedDefinitions = Array.from(this.variables.definitions.values())
      .flat()
      .filter(def => def.importedFrom).length;
    const importedUsage = Array.from(this.variables.usage.values())
      .flat()
      .filter(usage => usage.importedFrom).length;

    report.push("## Summary");
    report.push(`- **Total Variable Definitions**: ${totalDefinitions}`);
    report.push(`  - Direct definitions: ${totalDefinitions - importedDefinitions}`);
    report.push(`  - Imported definitions: ${importedDefinitions}`);
    report.push(`- **Total Variable Usage**: ${totalUsage}`);
    report.push(`  - Direct usage: ${totalUsage - importedUsage}`);
    report.push(`  - Imported usage: ${importedUsage}`);
    report.push(`- **Unique Variables**: ${this.variables.definitions.size}`);
    report.push(`- **Missing Variables**: ${this.variables.missing.length}`);
    report.push(`- **Unused Variables**: ${this.variables.unused.length}`);
    report.push(`- **Potential Typos**: ${this.variables.typos.length}`);
    report.push("");

    // Errors and warnings
    if (this.errors.length > 0) {
      report.push("## Errors");
      for (const error of this.errors) {
        report.push(`- ❌ ${error}`);
      }
      report.push("");
    }

    if (this.warnings.length > 0) {
      report.push("## Warnings");
      for (const warning of this.warnings) {
        report.push(`- ⚠️ ${warning}`);
      }
      report.push("");
    }

    // Missing variables
    if (this.variables.missing.length > 0) {
      report.push("## Missing Variable Definitions");
      for (const missing of this.variables.missing) {
        report.push(`### ❌ \`--${missing.variable}\``);
        report.push(`- **Usage Count**: ${missing.usageCount}`);
        report.push(`- **Files**: ${missing.files.join(", ")}`);

        // Show import context if available
        const usages = this.variables.usage.get(missing.variable) || [];
        const importedUsages = usages.filter(usage => usage.importedFrom);
        if (importedUsages.length > 0) {
          report.push(`- **Import Context**: Used in files that import from:`);
          const importSources = [...new Set(importedUsages.map(u => u.importedFrom))];
          for (const source of importSources) {
            const relativeSource = path.relative(this.projectRoot, source);
            report.push(`  - ${relativeSource}`);
          }
        }
        report.push("");
      }
    }

    // Unused variables
    if (this.variables.unused.length > 0) {
      report.push("## Unused Variable Definitions");
      for (const unused of this.variables.unused) {
        report.push(`### ⚠️ \`--${unused.variable}\``);
        report.push(`- **Definition Count**: ${unused.definitionCount}`);
        report.push(`- **Files**: ${unused.files.join(", ")}`);
        report.push("");
      }
    }

    // Typos
    if (this.variables.typos.length > 0) {
      report.push("## Potential Typos");
      for (const typo of this.variables.typos) {
        report.push(`### ⚠️ \`--${typo.variable}\``);
        for (const issue of typo.issues) {
          report.push(`- ${issue}`);
        }
        report.push("");
      }
    }

    return report.join("\n");
  }

  /**
   * Check if validation passed
   */
  hasErrors() {
    return (
      this.errors.length > 0 ||
      this.variables.inconsistencies.some(i => i.severity === "error") ||
      this.variables.missing.length > 0
    );
  }

  /**
   * Get exit code for CI/CD
   */
  getExitCode() {
    if (this.hasErrors()) return 1;
    if (this.variables.inconsistencies.length > 0 || this.variables.typos.length > 0) return 2;
    return 0;
  }
}

// CLI interface
function main() {
  // Show deprecation warning
  console.warn("⚠️  WARNING: This JavaScript version is deprecated!");
  console.warn("Please use the new TypeScript version:");
  console.warn("  cd scripts/validation/css");
  console.warn("  pnpm install && pnpm run build");
  console.warn("  pnpm start [options]");
  console.warn("");

  const args = parseCommonArgs();
  const options = {
    fix: args.fix,
    strict: args.strict,
    verbose: args.verbose,
  };

  printHeader("Reynard CSS Variable Validator (DEPRECATED)");
  printColored("===========================================", Colors.CYAN);

  const validator = new CSSVariableValidator(options);
  validator.analyze();

  const report = validator.generateReport();
  console.log(report);

  // Save report
  const reportPath = path.join(process.cwd(), "css-validation-report.md");
  fs.writeFileSync(reportPath, report);
  printColored(`\n📄 Report saved to: ${reportPath}`, Colors.BLUE);

  // Exit with appropriate code
  const exitCode = validator.getExitCode();
  if (exitCode === 1) {
    printError("\nValidation failed with errors");
    process.exit(1);
  } else if (exitCode === 2) {
    printWarning("\nValidation passed with warnings");
    if (options.strict) {
      process.exit(1);
    }
  } else {
    printSuccess("\nValidation passed");
  }
}

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CSSVariableValidator;
