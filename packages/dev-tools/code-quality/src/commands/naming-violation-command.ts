/**
 * 🦊 Naming Violation Command
 *
 * Command handler for scanning and reporting naming violations across the codebase.
 */

import { Command } from "commander";
import { NamingViolationScanner, type ScanResult, type NamingViolation } from "../NamingViolationScanner";
import { formatNamingViolationReport } from "./naming-violation-formatter";

export interface NamingViolationOptions {
  project?: string;
  output?: string;
  format?: "json" | "table" | "summary" | "report";
  severity?: "all" | "error" | "warning";
  type?: "all" | "class" | "function" | "variable" | "interface" | "type" | "enum" | "file" | "package";
  fix?: boolean;
  exclude?: string[];
  include?: string[];
}

export async function handleNamingViolationCommand(options: NamingViolationOptions): Promise<void> {
  const {
    project = process.cwd(),
    output,
    format = "summary",
    severity = "all",
    type = "all",
    fix = false,
    exclude = [],
  } = options;

  console.log("🦊 Reynard Naming Violation Scanner");
  console.log("=====================================");
  console.log(`📁 Scanning: ${project}`);
  console.log(`📊 Format: ${format}`);
  console.log(`⚠️  Severity: ${severity}`);
  console.log(`🏷️  Type: ${type}`);
  console.log("");

  try {
    const scanner = new NamingViolationScanner();

    // Add custom exclude patterns if provided
    if (exclude.length > 0) {
      scanner.addExcludePatterns(exclude);
    }

    const startTime = Date.now();
    const result = await scanner.scanDirectory(project);
    const endTime = Date.now();

    // Filter results based on options
    const filteredResult = filterResults(result, { severity, type });

    // Generate fix suggestions if requested
    if (fix) {
      generateFixSuggestions(filteredResult.violations);
    }

    // Format and output results
    const formattedOutput = formatNamingViolationReport(filteredResult, format);

    if (output) {
      const fs = await import("fs");
      fs.writeFileSync(output, formattedOutput);
      console.log(`📄 Results written to: ${output}`);
    } else {
      console.log(formattedOutput);
    }

    // Print summary
    console.log("");
    console.log("📊 Scan Summary");
    console.log("===============");
    console.log(`⏱️  Duration: ${endTime - startTime}ms`);
    console.log(`📁 Files scanned: ${result.totalFiles}`);
    console.log(`❌ Total violations: ${result.totalViolations}`);
    console.log(`🚨 Errors: ${result.summary.errors}`);
    console.log(`⚠️  Warnings: ${result.summary.warnings}`);

    if (Object.keys(result.summary.byType).length > 0) {
      console.log("📋 By type:");
      Object.entries(result.summary.byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    }

    // Exit with appropriate code
    if (result.summary.errors > 0) {
      console.log("");
      console.log("❌ Naming violations found! Please fix errors before proceeding.");
      process.exit(1);
    } else if (result.summary.warnings > 0) {
      console.log("");
      console.log("⚠️  Naming warnings found. Consider addressing them for better code quality.");
      process.exit(0);
    } else {
      console.log("");
      console.log("✅ No naming violations found! Code follows naming guidelines.");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error during naming violation scan:", error);
    process.exit(1);
  }
}

function filterResults(result: ScanResult, options: { severity: string; type: string }): ScanResult {
  let filteredViolations = result.violations;

  // Filter by severity
  if (options.severity !== "all") {
    filteredViolations = filteredViolations.filter(v => v.severity === options.severity);
  }

  // Filter by type
  if (options.type !== "all") {
    filteredViolations = filteredViolations.filter(v => v.type === options.type);
  }

  // Recalculate summary
  const summary = {
    errors: filteredViolations.filter(v => v.severity === "error").length,
    warnings: filteredViolations.filter(v => v.severity === "warning").length,
    byType: {} as Record<string, number>,
  };

  filteredViolations.forEach(violation => {
    summary.byType[violation.type] = (summary.byType[violation.type] || 0) + 1;
  });

  return {
    ...result,
    violations: filteredViolations,
    totalViolations: filteredViolations.length,
    summary,
  };
}

function generateFixSuggestions(violations: NamingViolation[]): void {
  console.log("");
  console.log("🔧 Fix Suggestions");
  console.log("==================");

  const suggestions = new Map<string, string[]>();

  violations.forEach(violation => {
    const key = `${violation.file}:${violation.line}`;
    if (!suggestions.has(key)) {
      suggestions.set(key, []);
    }
    suggestions.get(key)!.push(violation.suggestion);
  });

  suggestions.forEach((suggestionList, location) => {
    const [file, line] = location.split(":");
    console.log(`📁 ${file}:${line}`);
    suggestionList.forEach(suggestion => {
      console.log(`   💡 ${suggestion}`);
    });
    console.log("");
  });
}

export function createNamingViolationCommand(): Command {
  const command = new Command("naming-violations");

  command
    .description("Scan for naming violations and enforce naming guidelines")
    .option("-p, --project <path>", "Project root path", process.cwd())
    .option("-o, --output <file>", "Output file for results")
    .option("-f, --format <format>", "Output format (json, table, summary, report)", "summary")
    .option("-s, --severity <level>", "Filter by severity (all, error, warning)", "all")
    .option(
      "-t, --type <type>",
      "Filter by type (all, class, function, variable, interface, type, enum, file, package)",
      "all"
    )
    .option("--fix", "Generate fix suggestions")
    .option("--exclude <patterns...>", "Exclude patterns (regex)")
    .option("--include <patterns...>", "Include only these patterns (regex)")
    .action(handleNamingViolationCommand);

  return command;
}
