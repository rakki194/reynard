/**
 * Junk Detection Command Handler
 *
 * Advanced CLI command handler for detecting and analyzing Git-tracked development
 * artifacts in the Reynard monorepo. Provides comprehensive analysis of files
 * that shouldn't be tracked in version control, with configurable filtering,
 * multiple output formats, and integration with the quality gates system.
 */

import { JunkFileDetector, JunkFileAnalysis } from "../JunkFileDetector";
import { writeFileSync } from "fs";

export interface JunkDetectionOptions {
  project?: string;
  output?: string;
  format?: "json" | "table" | "summary" | "report";
  severity?: "all" | "critical" | "high" | "medium" | "low";
  category?: "all" | "python" | "typescript" | "reynard" | "general";
  fix?: boolean;
}

export async function handleJunkDetectionCommand(options: JunkDetectionOptions): Promise<void> {
  const projectRoot = options.project || process.cwd();
  const format = options.format || "summary";
  const severity = options.severity || "all";
  const category = options.category || "all";

  console.log("🦊 Reynard Junk File Detection");
  console.log("=".repeat(40));

  try {
    // Initialize detector
    const detector = new JunkFileDetector(projectRoot);

    // Run detection
    console.log(`🔍 Scanning project: ${projectRoot}`);
    const analysis = await detector.detectJunkFiles();

    // Filter results based on options
    const filteredAnalysis = filterAnalysis(analysis, severity, category);

    // Display results based on format
    switch (format) {
      case "json":
        await handleJsonOutput(filteredAnalysis, options.output);
        break;
      case "table":
        handleTableOutput(filteredAnalysis);
        break;
      case "report":
        handleReportOutput(filteredAnalysis, detector);
        break;
      case "summary":
      default:
        handleSummaryOutput(filteredAnalysis);
        break;
    }

    // Handle fix option
    if (options.fix && filteredAnalysis.files.length > 0) {
      await handleFixOption(filteredAnalysis, projectRoot);
    }

    // Exit with appropriate code
    if (filteredAnalysis.criticalIssues > 0 || filteredAnalysis.highIssues > 0) {
      console.log("\n❌ Critical or high-priority junk files detected!");
      process.exit(1);
    } else if (filteredAnalysis.totalFiles > 0) {
      console.log("\n⚠️ Junk files detected, but none are critical or high-priority.");
      process.exit(0);
    } else {
      console.log("\n✅ No junk files detected! Repository is clean.");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Junk file detection failed:", error);
    process.exit(1);
  }
}

/**
 * Filter analysis results based on severity and category
 */
function filterAnalysis(analysis: JunkFileAnalysis, severity: string, category: string): JunkFileAnalysis {
  let filteredFiles = analysis.files;

  // Filter by severity
  if (severity !== "all") {
    filteredFiles = filteredFiles.filter(file => file.severity === severity);
  }

  // Filter by category
  if (category !== "all") {
    filteredFiles = filteredFiles.filter(file => file.category === category);
  }

  // Recalculate metrics for filtered results
  const pythonArtifacts = filteredFiles.filter(f => f.category === "python").length;
  const typescriptArtifacts = filteredFiles.filter(f => f.category === "typescript").length;
  const reynardArtifacts = filteredFiles.filter(f => f.category === "reynard").length;
  const generalArtifacts = filteredFiles.filter(f => f.category === "general").length;

  const criticalIssues = filteredFiles.filter(f => f.severity === "critical").length;
  const highIssues = filteredFiles.filter(f => f.severity === "high").length;
  const mediumIssues = filteredFiles.filter(f => f.severity === "medium").length;
  const lowIssues = filteredFiles.filter(f => f.severity === "low").length;

  // Recalculate quality score
  const totalIssues = filteredFiles.length;
  const qualityScore =
    totalIssues === 0
      ? 100
      : Math.max(0, 100 - (criticalIssues * 20 + highIssues * 10 + mediumIssues * 5 + lowIssues * 2));

  return {
    ...analysis,
    totalFiles: filteredFiles.length,
    pythonArtifacts,
    typescriptArtifacts,
    reynardArtifacts,
    generalArtifacts,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues,
    files: filteredFiles,
    qualityScore: Math.round(qualityScore),
  };
}

/**
 * Handle JSON output format
 */
async function handleJsonOutput(analysis: JunkFileAnalysis, outputFile?: string): Promise<void> {
  const jsonOutput = JSON.stringify(analysis, null, 2);

  if (outputFile) {
    writeFileSync(outputFile, jsonOutput);
    console.log(`📄 Results saved to: ${outputFile}`);
  } else {
    console.log(jsonOutput);
  }
}

/**
 * Handle table output format
 */
function handleTableOutput(analysis: JunkFileAnalysis): void {
  console.log("\n📊 Junk File Detection Results:");
  console.log("=".repeat(60));

  // Summary table
  console.log("\n📈 Summary:");
  console.log("┌─────────────────────┬─────────┐");
  console.log("│ Category            │ Count   │");
  console.log("├─────────────────────┼─────────┤");
  console.log(`│ Python Artifacts    │ ${analysis.pythonArtifacts.toString().padStart(7)} │`);
  console.log(`│ TypeScript Artifacts│ ${analysis.typescriptArtifacts.toString().padStart(7)} │`);
  console.log(`│ Reynard Artifacts   │ ${analysis.reynardArtifacts.toString().padStart(7)} │`);
  console.log(`│ General Artifacts   │ ${analysis.generalArtifacts.toString().padStart(7)} │`);
  console.log(`│ Total Files         │ ${analysis.totalFiles.toString().padStart(7)} │`);
  console.log("└─────────────────────┴─────────┘");

  // Severity table
  console.log("\n⚠️ Severity Breakdown:");
  console.log("┌─────────────┬─────────┬─────────┐");
  console.log("│ Severity    │ Count   │ Emoji   │");
  console.log("├─────────────┼─────────┼─────────┤");
  console.log(`│ Critical    │ ${analysis.criticalIssues.toString().padStart(7)} │ 🔴      │`);
  console.log(`│ High        │ ${analysis.highIssues.toString().padStart(7)} │ 🟠      │`);
  console.log(`│ Medium      │ ${analysis.mediumIssues.toString().padStart(7)} │ 🟡      │`);
  console.log(`│ Low         │ ${analysis.lowIssues.toString().padStart(7)} │ 🟢      │`);
  console.log("└─────────────┴─────────┴─────────┘");

  console.log(`\n📈 Quality Score: ${analysis.qualityScore}/100`);

  // Files table (if any)
  if (analysis.files.length > 0) {
    console.log("\n📁 Detected Files:");
    console.log(
      "┌─────────────────────────────────────────────────────────────┬─────────────┬─────────────┬─────────────────────┐"
    );
    console.log(
      "│ File Path                                                  │ Category    │ Severity   │ Reason              │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┼─────────────┼─────────────┼─────────────────────┤"
    );

    analysis.files.slice(0, 20).forEach(file => {
      const severityEmoji = {
        critical: "🔴",
        high: "🟠",
        medium: "🟡",
        low: "🟢",
      }[file.severity];

      const truncatedPath = file.file.length > 60 ? file.file.substring(0, 57) + "..." : file.file;
      const truncatedReason = file.reason.length > 18 ? file.reason.substring(0, 15) + "..." : file.reason;

      console.log(
        `│ ${truncatedPath.padEnd(59)} │ ${file.category.padEnd(11)} │ ${(severityEmoji + " " + file.severity).padEnd(11)} │ ${truncatedReason.padEnd(19)} │`
      );
    });

    if (analysis.files.length > 20) {
      console.log(`│ ... and ${analysis.files.length - 20} more files`.padEnd(119) + "│");
    }

    console.log(
      "└─────────────────────────────────────────────────────────────┴─────────────┴─────────────┴─────────────────────┘"
    );
  }
}

/**
 * Handle report output format
 */
function handleReportOutput(analysis: JunkFileAnalysis, detector: JunkFileDetector): void {
  const report = detector.generateReport(analysis);
  console.log("\n" + report);
}

/**
 * Handle summary output format
 */
function handleSummaryOutput(analysis: JunkFileAnalysis): void {
  console.log("\n📊 Git-Tracked Junk File Detection Results:");
  console.log(`   🐍 Python artifacts: ${analysis.pythonArtifacts} files`);
  console.log(`   📦 TypeScript/JS artifacts: ${analysis.typescriptArtifacts} files`);
  console.log(`   🦊 Reynard-specific artifacts: ${analysis.reynardArtifacts} files`);
  console.log(`   📋 General artifacts: ${analysis.generalArtifacts} files`);
  console.log(`   📋 Total tracked junk files: ${analysis.totalFiles} files`);

  if (analysis.totalFiles > 0) {
    console.log("\n⚠️ Severity Breakdown:");
    console.log(`   🔴 Critical: ${analysis.criticalIssues} files`);
    console.log(`   🟠 High: ${analysis.highIssues} files`);
    console.log(`   🟡 Medium: ${analysis.mediumIssues} files`);
    console.log(`   🟢 Low: ${analysis.lowIssues} files`);

    console.log(`\n📈 Quality Score: ${analysis.qualityScore}/100`);

    console.log("\n📁 Sample detected files:");
    analysis.files.slice(0, 10).forEach(file => {
      const severityEmoji = {
        critical: "🔴",
        high: "🟠",
        medium: "🟡",
        low: "🟢",
      }[file.severity];
      console.log(`   ${severityEmoji} ${file.file} (${file.category}: ${file.reason})`);
    });

    if (analysis.files.length > 10) {
      console.log(`   ... and ${analysis.files.length - 10} more files`);
    }

    console.log("\n💡 Recommendations:");
    analysis.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });
  } else {
    console.log("\n✅ No tracked junk files detected! Git repository is clean.");
  }
}

/**
 * Handle fix option - generate git commands to remove files
 */
async function handleFixOption(analysis: JunkFileAnalysis, _projectRoot: string): Promise<void> {
  console.log("\n🔧 Fix Commands:");
  console.log("=".repeat(40));

  const criticalFiles = analysis.files.filter(f => f.severity === "critical");
  const highFiles = analysis.files.filter(f => f.severity === "high");

  if (criticalFiles.length > 0) {
    console.log("\n🔴 Critical files (recommended to remove immediately):");
    criticalFiles.forEach(file => {
      console.log(`   git rm --cached "${file.file}"`);
    });
  }

  if (highFiles.length > 0) {
    console.log("\n🟠 High-priority files (recommended to remove):");
    highFiles.forEach(file => {
      console.log(`   git rm --cached "${file.file}"`);
    });
  }

  console.log("\n💡 After removing files, update .gitignore to prevent future tracking:");
  console.log("   # Add appropriate patterns to .gitignore");
  console.log("   git add .gitignore");
  console.log("   git commit -m 'Remove junk files and update .gitignore'");
}
