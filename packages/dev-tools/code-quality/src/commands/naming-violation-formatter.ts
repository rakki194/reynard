/**
 * 🦊 Naming Violation Formatter
 *
 * Formats naming violation scan results into various output formats.
 */

import { ScanResult, NamingViolation } from "../NamingViolationScanner";

export function formatNamingViolationReport(result: ScanResult, format: string): string {
  switch (format.toLowerCase()) {
    case "json":
      return formatAsJson(result);
    case "table":
      return formatAsTable(result);
    case "report":
      return formatAsReport(result);
    case "summary":
    default:
      return formatAsSummary(result);
  }
}

function formatAsJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

function formatAsTable(result: ScanResult): string {
  if (result.violations.length === 0) {
    return "✅ No naming violations found!";
  }

  const lines: string[] = [];
  lines.push("┌─────────────────────────────────────────────────────────────────────────────────────────┐");
  lines.push("│ 🦊 Naming Violation Report                                                              │");
  lines.push("├─────────────────────────────────────────────────────────────────────────────────────────┤");
  lines.push("│ File                                    │ Line │ Type      │ Severity │ Violation        │");
  lines.push("├─────────────────────────────────────────────────────────────────────────────────────────┤");

  result.violations.forEach(violation => {
    const file = truncateString(violation.file, 35);
    const line = violation.line.toString().padStart(4);
    const type = violation.type.padEnd(9);
    const severity = violation.severity === "error" ? "❌ ERROR" : "⚠️  WARN";
    const violationText = truncateString(violation.violation, 15);

    lines.push(`│ ${file.padEnd(35)} │ ${line} │ ${type} │ ${severity.padEnd(7)} │ ${violationText.padEnd(15)} │`);
  });

  lines.push("└─────────────────────────────────────────────────────────────────────────────────────────┘");

  return lines.join("\n");
}

function formatAsReport(result: ScanResult): string {
  const lines: string[] = [];

  lines.push("🦊 Reynard Naming Violation Report");
  lines.push("===================================");
  lines.push("");

  // Summary
  lines.push("📊 Summary");
  lines.push("----------");
  lines.push(`Total files scanned: ${result.totalFiles}`);
  lines.push(`Total violations: ${result.totalViolations}`);
  lines.push(`Errors: ${result.summary.errors}`);
  lines.push(`Warnings: ${result.summary.warnings}`);
  lines.push("");

  // Violations by type
  if (Object.keys(result.summary.byType).length > 0) {
    lines.push("📋 Violations by Type");
    lines.push("---------------------");
    Object.entries(result.summary.byType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        lines.push(`${type}: ${count}`);
      });
    lines.push("");
  }

  // Detailed violations
  if (result.violations.length > 0) {
    lines.push("🚨 Detailed Violations");
    lines.push("----------------------");
    lines.push("");

    // Group by file
    const violationsByFile = new Map<string, NamingViolation[]>();
    result.violations.forEach(violation => {
      if (!violationsByFile.has(violation.file)) {
        violationsByFile.set(violation.file, []);
      }
      violationsByFile.get(violation.file)!.push(violation);
    });

    violationsByFile.forEach((violations, file) => {
      lines.push(`📁 ${file}`);
      lines.push("─".repeat(file.length + 4));

      violations.forEach(violation => {
        const severity = violation.severity === "error" ? "❌" : "⚠️";
        lines.push(`  ${severity} Line ${violation.line}: ${violation.violation} (${violation.type})`);
        lines.push(`     Context: ${violation.context}`);
        lines.push(`     Suggestion: ${violation.suggestion}`);
        lines.push("");
      });
    });
  } else {
    lines.push("✅ No naming violations found!");
    lines.push("");
    lines.push("Your code follows the Reynard naming guidelines:");
    lines.push("• No forbidden marketing prefixes (Unified, Enhanced, Advanced, etc.)");
    lines.push("• Clear, descriptive naming that explains purpose");
    lines.push("• Appropriate complexity and specificity");
    lines.push("");
  }

  return lines.join("\n");
}

function formatAsSummary(result: ScanResult): string {
  const lines: string[] = [];

  if (result.violations.length === 0) {
    lines.push("✅ No naming violations found!");
    lines.push("");
    lines.push("Your code follows the Reynard naming guidelines.");
    return lines.join("\n");
  }

  lines.push("🚨 Naming Violations Found");
  lines.push("==========================");
  lines.push("");

  // Quick summary
  lines.push(`📊 ${result.totalViolations} violations in ${result.totalFiles} files`);
  lines.push(`❌ ${result.summary.errors} errors, ⚠️ ${result.summary.warnings} warnings`);
  lines.push("");

  // Top violations by type
  if (Object.keys(result.summary.byType).length > 0) {
    lines.push("📋 Violations by Type:");
    Object.entries(result.summary.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Show top 5
      .forEach(([type, count]) => {
        lines.push(`   ${type}: ${count}`);
      });
    lines.push("");
  }

  // Show first few violations
  const topViolations = result.violations.slice(0, 5);
  lines.push("🔍 Top Violations:");
  topViolations.forEach((violation, index) => {
    const severity = violation.severity === "error" ? "❌" : "⚠️";
    const file = truncateString(violation.file, 50);
    lines.push(`   ${index + 1}. ${severity} ${file}:${violation.line} - ${violation.violation}`);
  });

  if (result.violations.length > 5) {
    lines.push(`   ... and ${result.violations.length - 5} more violations`);
  }

  lines.push("");
  lines.push("💡 Run with --format report for detailed information");
  lines.push("🔧 Run with --fix for fix suggestions");

  return lines.join("\n");
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + "...";
}

export function formatViolationForConsole(violation: NamingViolation): string {
  const severity = violation.severity === "error" ? "❌" : "⚠️";
  const lines: string[] = [];

  lines.push(`${severity} ${violation.file}:${violation.line}:${violation.column}`);
  lines.push(`   Type: ${violation.type}`);
  lines.push(`   Violation: ${violation.violation}`);
  lines.push(`   Context: ${violation.context}`);
  lines.push(`   Suggestion: ${violation.suggestion}`);

  return lines.join("\n");
}

export function formatViolationForJson(violation: NamingViolation): object {
  return {
    file: violation.file,
    line: violation.line,
    column: violation.column,
    type: violation.type,
    severity: violation.severity,
    violation: violation.violation,
    context: violation.context,
    suggestion: violation.suggestion,
  };
}
