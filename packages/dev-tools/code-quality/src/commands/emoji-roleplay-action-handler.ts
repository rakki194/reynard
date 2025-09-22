/**
 * Emoji Roleplay Action Handler
 *
 * Handles the main action logic for the emoji roleplay command,
 * including scanning, analysis, and report generation.
 */

import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { EmojiRoleplayScanner, EmojiRoleplayScanResult } from "../EmojiRoleplayScanner";
import { writeFileSync } from "fs";
import { join } from "path";

interface EmojiRoleplayOptions {
  project: string;
  output?: string;
  files?: string[];
  format: string;
  threshold: string;
}

interface ScanSummary {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  totalEmojis: number;
  totalRoleplayPatterns: number;
  totalRoleplayActions: number;
}

interface EmojiRoleplayMetrics {
  professionalLanguageScore: number;
}

/**
 * Handle emoji roleplay scanning action
 */
export async function handleEmojiRoleplayAction(options: EmojiRoleplayOptions): Promise<void> {
  try {
    const analyzer = new CodeQualityAnalyzer(options.project);
    const scanner = new EmojiRoleplayScanner();

    console.log("🔍 Scanning for emojis and roleplay language...\n");

    const results = await performScan(options, analyzer, scanner);
    const summary = scanner.getScanSummary(results);
    const metrics = await analyzer.getEmojiRoleplayMetrics();

    displaySummary(summary, metrics);
    checkThreshold(metrics, options);

    const report = generateReport(options, scanner, results, summary, metrics);
    outputReport(options, report);

    // Exit with appropriate code
    if (metrics.professionalLanguageScore < parseInt(options.threshold)) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error during emoji and roleplay scanning:", error);
    process.exit(1);
  }
}

/**
 * Perform the actual scanning based on options
 */
async function performScan(
  options: EmojiRoleplayOptions,
  analyzer: CodeQualityAnalyzer,
  scanner: EmojiRoleplayScanner
): Promise<EmojiRoleplayScanResult[]> {
  let results;
  if (options.files && options.files.length > 0) {
    // Scan specific files
    results = scanner.scanFiles(options.files);
    console.log(`📁 Scanned ${options.files.length} specific files`);
  } else {
    // Scan entire project
    results = await analyzer.scanEmojiRoleplay();
  }
  return results;
}

/**
 * Display scan summary
 */
function displaySummary(summary: ScanSummary, metrics: EmojiRoleplayMetrics): void {
  console.log("📊 Scan Summary:");
  console.log(`   Total Files: ${summary.totalFiles}`);
  console.log(`   Files with Issues: ${summary.filesWithIssues}`);
  console.log(`   Total Issues: ${summary.totalIssues}`);
  console.log(`   Emojis: ${summary.totalEmojis}`);
  console.log(`   Roleplay Patterns: ${summary.totalRoleplayPatterns}`);
  console.log(`   Roleplay Actions: ${summary.totalRoleplayActions}`);
  console.log(`   Professional Language Score: ${metrics.professionalLanguageScore}/100\n`);
}

/**
 * Check threshold and display warning/success message
 */
function checkThreshold(metrics: EmojiRoleplayMetrics, options: EmojiRoleplayOptions): void {
  const threshold = parseInt(options.threshold);
  if (metrics.professionalLanguageScore < threshold) {
    console.log(
      `⚠️  Warning: Professional language score (${metrics.professionalLanguageScore}) is below threshold (${threshold})`
    );
  } else {
    console.log(`✅ Professional language score (${metrics.professionalLanguageScore}) meets threshold (${threshold})`);
  }
}

/**
 * Generate report based on format
 */
function generateReport(
  options: EmojiRoleplayOptions,
  scanner: EmojiRoleplayScanner,
  results: EmojiRoleplayScanResult[],
  summary: ScanSummary,
  metrics: EmojiRoleplayMetrics
): string {
  if (options.format === "json") {
    return JSON.stringify(
      {
        summary,
        metrics,
        results,
      },
      null,
      2
    );
  } else {
    return scanner.generateReport(results);
  }
}

/**
 * Output report to file or console
 */
function outputReport(options: EmojiRoleplayOptions, report: string): void {
  if (options.output) {
    const outputPath = join(options.project, options.output);
    writeFileSync(outputPath, report);
    console.log(`\n📄 Report saved to: ${outputPath}`);
  } else {
    console.log("\n📄 Report:");
    console.log(report);
  }
}
