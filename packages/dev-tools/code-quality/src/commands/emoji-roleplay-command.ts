/**
 * Emoji and Roleplay Scanning Command
 *
 * CLI command for scanning and reporting on emojis and roleplay language
 * in documentation, Python, and TypeScript files.
 */

import { Command } from "commander";
import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { EmojiRoleplayScanner } from "../EmojiRoleplayScanner";
import { writeFileSync } from "fs";
import { join } from "path";

export function createEmojiRoleplayCommand(): Command {
  const command = new Command("emoji-roleplay");

  command
    .description("Scan for emojis and roleplay language in documentation and code files")
    .option("-p, --project <path>", "Project root path", process.cwd())
    .option("-o, --output <file>", "Output report file path")
    .option("-f, --files <files...>", "Specific files to scan")
    .option("--format <format>", "Output format (markdown, json)", "markdown")
    .option("--threshold <number>", "Professional language score threshold", "80")
    .action(async options => {
      try {
        const analyzer = new CodeQualityAnalyzer(options.project);
        const scanner = new EmojiRoleplayScanner();

        console.log("🔍 Scanning for emojis and roleplay language...\n");

        let results;
        if (options.files && options.files.length > 0) {
          // Scan specific files
          results = scanner.scanFiles(options.files);
          console.log(`📁 Scanned ${options.files.length} specific files`);
        } else {
          // Scan entire project
          results = await analyzer.scanEmojiRoleplay();
        }

        const summary = scanner.getScanSummary(results);
        const metrics = await analyzer.getEmojiRoleplayMetrics();

        // Display summary
        console.log("📊 Scan Summary:");
        console.log(`   Total Files: ${summary.totalFiles}`);
        console.log(`   Files with Issues: ${summary.filesWithIssues}`);
        console.log(`   Total Issues: ${summary.totalIssues}`);
        console.log(`   Emojis: ${summary.totalEmojis}`);
        console.log(`   Roleplay Patterns: ${summary.totalRoleplayPatterns}`);
        console.log(`   Roleplay Actions: ${summary.totalRoleplayActions}`);
        console.log(`   Professional Language Score: ${metrics.professionalLanguageScore}/100\n`);

        // Check threshold
        const threshold = parseInt(options.threshold);
        if (metrics.professionalLanguageScore < threshold) {
          console.log(
            `⚠️  Warning: Professional language score (${metrics.professionalLanguageScore}) is below threshold (${threshold})`
          );
        } else {
          console.log(
            `✅ Professional language score (${metrics.professionalLanguageScore}) meets threshold (${threshold})`
          );
        }

        // Generate report
        let report: string;
        if (options.format === "json") {
          report = JSON.stringify(
            {
              summary,
              metrics,
              results,
            },
            null,
            2
          );
        } else {
          report = scanner.generateReport(results);
        }

        // Output report
        if (options.output) {
          const outputPath = join(options.project, options.output);
          writeFileSync(outputPath, report);
          console.log(`\n📄 Report saved to: ${outputPath}`);
        } else {
          console.log("\n📄 Report:");
          console.log(report);
        }

        // Exit with appropriate code
        if (metrics.professionalLanguageScore < threshold) {
          process.exit(1);
        }
      } catch (error) {
        console.error("❌ Error during emoji and roleplay scanning:", error);
        process.exit(1);
      }
    });

  return command;
}
