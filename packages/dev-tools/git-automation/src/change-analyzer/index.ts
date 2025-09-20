/**
 * 🦊 Change Analyzer
 *
 * Main entry point for the change analyzer module
 */

import chalk from "chalk";
import ora from "ora";
import { FileChangeAnalyzer } from "./file-analyzer";
import { VersionBumpAnalyzer } from "./version-analyzer";
import type { ChangeAnalysisResult } from "./types";

export class ChangeAnalyzer {
  private fileAnalyzer = new FileChangeAnalyzer();
  private versionAnalyzer = new VersionBumpAnalyzer();

  /**
   * Analyze all changes in the working directory
   */
  async analyzeChanges(workingDir: string = "."): Promise<ChangeAnalysisResult> {
    const spinner = ora("📊 Analyzing Git changes...").start();

    try {
      // Get file changes
      const fileChanges = await this.fileAnalyzer.getFileChanges(workingDir);

      // Get diff statistics
      const diffStats = await this.fileAnalyzer.getDiffStatistics(workingDir);

      // Categorize changes
      const categories = this.fileAnalyzer.categorizeFiles(fileChanges);

      // Determine version bump type
      const versionBumpType = this.versionAnalyzer.determineVersionBump(categories);

      // Check for special change types
      const hasBreakingChanges = this.versionAnalyzer.detectBreakingChanges(categories);
      const securityChanges = this.versionAnalyzer.detectSecurityChanges(categories);
      const performanceChanges = this.versionAnalyzer.detectPerformanceChanges(categories);

      const result: ChangeAnalysisResult = {
        totalFiles: fileChanges.length,
        totalAdditions: diffStats.additions,
        totalDeletions: diffStats.deletions,
        categories,
        versionBumpType,
        hasBreakingChanges,
        securityChanges,
        performanceChanges,
      };

      spinner.succeed(chalk.green("✅ Change analysis complete"));
      this.displayResults(result);

      return result;
    } catch (error) {
      spinner.fail(chalk.red("❌ Change analysis failed"));
      throw error;
    }
  }

  /**
   * Display analysis results
   */
  public displayResults(result: ChangeAnalysisResult): void {
    console.log(chalk.blue("\n📊 Change Analysis Results:"));
    console.log(chalk.gray(`Files changed: ${result.totalFiles}`));
    console.log(chalk.gray(`Additions: +${result.totalAdditions}`));
    console.log(chalk.gray(`Deletions: -${result.totalDeletions}`));
    console.log(chalk.gray(`Version bump: ${result.versionBumpType}`));

    if (result.hasBreakingChanges) {
      console.log(chalk.red("⚠️  Breaking changes detected"));
    }

    if (result.securityChanges) {
      console.log(chalk.yellow("🔒 Security changes detected"));
    }

    if (result.performanceChanges) {
      console.log(chalk.cyan("⚡ Performance changes detected"));
    }

    console.log(chalk.blue("\n📁 Categories:"));
    result.categories.forEach(category => {
      const emoji = this.getCategoryEmoji(category.type);
      console.log(
        chalk.gray(`  ${emoji} ${category.type}: ${category.files.length} files (${category.impact} impact)`)
      );
    });
  }

  private getCategoryEmoji(type: string): string {
    const emojis: Record<string, string> = {
      feature: "✨",
      fix: "🐛",
      docs: "📚",
      refactor: "♻️",
      test: "🧪",
      chore: "🔧",
      perf: "⚡",
      style: "💄",
    };
    return emojis[type] || "📝";
  }
}

// Re-export types
export * from "./types";
