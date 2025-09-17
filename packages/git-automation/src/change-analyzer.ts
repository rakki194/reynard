/**
 * 🦊 Change Analyzer
 *
 * Modular component for analyzing Git changes and determining their impact
 * and categorization for commit message generation and version bumping.
 */

import { execa } from "execa";
import chalk from "chalk";
import ora from "ora";

export interface FileChange {
  file: string;
  status: "added" | "modified" | "deleted" | "renamed" | "copied";
  additions?: number;
  deletions?: number;
}

export interface ChangeCategory {
  type: "feature" | "fix" | "docs" | "refactor" | "test" | "chore" | "perf" | "style";
  files: FileChange[];
  impact: "low" | "medium" | "high";
  description: string;
}

export interface ChangeAnalysisResult {
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
  categories: ChangeCategory[];
  versionBumpType: "major" | "minor" | "patch";
  hasBreakingChanges: boolean;
  securityChanges: boolean;
  performanceChanges: boolean;
}

export class ChangeAnalyzer {
  /**
   * Analyze all changes in the working directory
   */
  async analyzeChanges(workingDir: string = "."): Promise<ChangeAnalysisResult> {
    const spinner = ora("📊 Analyzing Git changes...").start();

    try {
      // Get file changes
      const fileChanges = await this.getFileChanges(workingDir);

      // Get diff statistics
      const diffStats = await this.getDiffStatistics(workingDir);

      // Categorize changes
      const categories = this.categorizeChanges(fileChanges);

      // Determine version bump type
      const versionBumpType = this.determineVersionBumpType(categories, fileChanges);

      // Check for special change types
      const hasBreakingChanges = this.detectBreakingChanges(fileChanges);
      const securityChanges = this.detectSecurityChanges(fileChanges);
      const performanceChanges = this.detectPerformanceChanges(fileChanges);

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

      spinner.succeed(`Analyzed ${fileChanges.length} changed files`);
      return result;
    } catch (error) {
      spinner.fail("Failed to analyze changes");
      throw error;
    }
  }

  /**
   * Get list of changed files with their status
   */
  private async getFileChanges(workingDir: string): Promise<FileChange[]> {
    try {
      const { stdout } = await execa("git", ["diff", "--name-status", "--cached"], {
        cwd: workingDir,
      });

      if (!stdout.trim()) {
        // Check unstaged changes if no staged changes
        const { stdout: unstaged } = await execa("git", ["diff", "--name-status"], {
          cwd: workingDir,
        });

        if (!unstaged.trim()) {
          return [];
        }

        return this.parseFileChanges(unstaged);
      }

      return this.parseFileChanges(stdout);
    } catch (error) {
      throw new Error(`Failed to get file changes: ${error}`);
    }
  }

  /**
   * Parse git diff --name-status output
   */
  private parseFileChanges(output: string): FileChange[] {
    const lines = output.trim().split("\n");
    const changes: FileChange[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const [status, file] = line.split("\t");
      if (!status || !file) continue;

      let changeStatus: FileChange["status"];
      switch (status[0]) {
        case "A":
          changeStatus = "added";
          break;
        case "M":
          changeStatus = "modified";
          break;
        case "D":
          changeStatus = "deleted";
          break;
        case "R":
          changeStatus = "renamed";
          break;
        case "C":
          changeStatus = "copied";
          break;
        default:
          changeStatus = "modified";
          break;
      }

      changes.push({
        file,
        status: changeStatus,
      });
    }

    return changes;
  }

  /**
   * Get diff statistics (additions/deletions)
   */
  private async getDiffStatistics(workingDir: string): Promise<{ additions: number; deletions: number }> {
    try {
      const { stdout } = await execa("git", ["diff", "--stat", "--cached"], {
        cwd: workingDir,
      });

      if (!stdout.trim()) {
        // Check unstaged changes if no staged changes
        const { stdout: unstaged } = await execa("git", ["diff", "--stat"], {
          cwd: workingDir,
        });

        if (!unstaged.trim()) {
          return { additions: 0, deletions: 0 };
        }

        return this.parseDiffStatistics(unstaged);
      }

      return this.parseDiffStatistics(stdout);
    } catch (error) {
      return { additions: 0, deletions: 0 };
    }
  }

  /**
   * Parse git diff --stat output to extract additions/deletions
   */
  private parseDiffStatistics(output: string): { additions: number; deletions: number } {
    const lines = output.trim().split("\n");
    let additions = 0;
    let deletions = 0;

    for (const line of lines) {
      // Look for lines like " 2 files changed, 3 insertions(+), 1 deletion(-)"
      const match = line.match(/(\d+) insertions?\(\+\).*?(\d+) deletions?\(-\)/);
      if (match) {
        additions += parseInt(match[1], 10);
        deletions += parseInt(match[2], 10);
      }
    }

    return { additions, deletions };
  }

  /**
   * Categorize changes by type and impact
   */
  private categorizeChanges(fileChanges: FileChange[]): ChangeCategory[] {
    const categories: ChangeCategory[] = [];
    const categoryMap = new Map<string, FileChange[]>();

    for (const change of fileChanges) {
      const category = this.determineChangeCategory(change);

      if (!categoryMap.has(category.type)) {
        categoryMap.set(category.type, []);
      }
      categoryMap.get(category.type)!.push(change);
    }

    for (const [type, files] of categoryMap) {
      const impact = this.determineImpact(type, files);
      const description = this.getCategoryDescription(type, files.length);

      categories.push({
        type: type as ChangeCategory["type"],
        files,
        impact,
        description,
      });
    }

    return categories;
  }

  /**
   * Determine the category of a file change
   */
  private determineChangeCategory(change: FileChange): { type: string; impact: string } {
    const file = change.file.toLowerCase();

    // Auth/Security changes (check this before feature changes)
    if (file.includes("auth/") || file.includes("security/") || file.includes("password")) {
      return { type: "fix", impact: "high" };
    }

    // Feature changes
    if (
      file.includes("feature/") ||
      file.includes("feat/") ||
      (file.includes("src/") &&
        (file.includes("component") || file.includes("ui") || file.includes("widget")) &&
        !file.includes("test") &&
        !file.includes("spec"))
    ) {
      return { type: "feature", impact: "medium" };
    }

    // Test changes
    if (file.includes("test") || file.includes("spec") || file.includes("__tests__")) {
      return { type: "test", impact: "low" };
    }

    // Utils changes
    if (file.includes("src/utils/") || file.includes("utils/")) {
      return { type: "fix", impact: "medium" };
    }

    // Performance changes
    if (file.includes("perf/") || file.includes("optimize") || file.includes("performance")) {
      return { type: "perf", impact: "high" };
    }

    // Documentation changes
    if (file.endsWith(".md") || file.includes("docs/") || file.includes("README")) {
      return { type: "docs", impact: "low" };
    }

    // Configuration changes
    if (
      file.includes("config") ||
      file.includes("package.json") ||
      file.includes("tsconfig") ||
      file.includes(".json")
    ) {
      return { type: "chore", impact: "low" };
    }

    // Style changes
    if (file.endsWith(".css") || file.endsWith(".scss") || file.endsWith(".less")) {
      return { type: "style", impact: "low" };
    }

    // Performance changes
    if (file.includes("perf") || file.includes("optimize") || file.includes("performance")) {
      return { type: "perf", impact: "high" };
    }

    // Security changes
    if (file.includes("auth") || file.includes("security") || file.includes("password")) {
      return { type: "fix", impact: "high" };
    }

    // Default to fix for modified files, chore for others
    return { type: change.status === "modified" ? "fix" : "chore", impact: "medium" };
  }

  /**
   * Determine the impact level of a category
   */
  private determineImpact(type: string, files: FileChange[]): "low" | "medium" | "high" {
    const highImpactTypes = ["feature", "perf"];
    const lowImpactTypes = ["docs", "test", "style"];

    if (highImpactTypes.includes(type)) return "high";
    if (lowImpactTypes.includes(type)) return "low";
    if (files.length > 10) return "high";
    if (files.length > 5) return "medium";
    return "low";
  }

  /**
   * Get description for a category
   */
  private getCategoryDescription(type: string, count: number): string {
    const descriptions = {
      feature: `New features and capabilities (${count} files)`,
      fix: `Bug fixes and improvements (${count} files)`,
      docs: `Documentation updates (${count} files)`,
      refactor: `Code refactoring and organization (${count} files)`,
      test: `Test coverage and improvements (${count} files)`,
      chore: `Maintenance and configuration (${count} files)`,
      perf: `Performance optimizations (${count} files)`,
      style: `Code style and formatting (${count} files)`,
    };

    return descriptions[type as keyof typeof descriptions] || `Changes (${count} files)`;
  }

  /**
   * Determine version bump type based on changes
   */
  private determineVersionBumpType(
    categories: ChangeCategory[],
    fileChanges: FileChange[]
  ): "major" | "minor" | "patch" {
    // Check for breaking changes
    if (this.detectBreakingChanges(fileChanges)) {
      return "major";
    }

    // Check for new features
    if (categories.some(cat => cat.type === "feature")) {
      return "minor";
    }

    // Check for performance or significant changes
    if (categories.some(cat => cat.type === "perf" || cat.impact === "high")) {
      return "minor";
    }

    // Default to patch
    return "patch";
  }

  /**
   * Detect breaking changes
   */
  private detectBreakingChanges(fileChanges: FileChange[]): boolean {
    const breakingPatterns = [/BREAKING CHANGE/i, /feat!:/, /fix!:/, /api\//, /schema\//];

    for (const change of fileChanges) {
      for (const pattern of breakingPatterns) {
        if (pattern.test(change.file)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Detect security-related changes
   */
  private detectSecurityChanges(fileChanges: FileChange[]): boolean {
    const securityPatterns = [/auth/, /security/, /password/, /token/, /key/, /secret/, /credential/];

    return fileChanges.some(change => securityPatterns.some(pattern => pattern.test(change.file)));
  }

  /**
   * Detect performance-related changes
   */
  private detectPerformanceChanges(fileChanges: FileChange[]): boolean {
    const performancePatterns = [/perf/, /optimize/, /performance/, /cache/, /lazy/, /memo/];

    return fileChanges.some(change => performancePatterns.some(pattern => pattern.test(change.file)));
  }

  /**
   * Display change analysis results
   */
  displayResults(result: ChangeAnalysisResult): void {
    console.log(chalk.blue("\n📊 Change Analysis Results:"));
    console.log(chalk.blue("=".repeat(40)));

    console.log(chalk.cyan(`📁 Total files changed: ${result.totalFiles}`));
    console.log(chalk.green(`➕ Additions: ${result.totalAdditions}`));
    console.log(chalk.red(`➖ Deletions: ${result.totalDeletions}`));
    console.log(chalk.yellow(`📈 Version bump: ${result.versionBumpType}`));

    if (result.hasBreakingChanges) {
      console.log(chalk.red("⚠️  Breaking changes detected"));
    }

    if (result.securityChanges) {
      console.log(chalk.yellow("🔒 Security changes detected"));
    }

    if (result.performanceChanges) {
      console.log(chalk.blue("⚡ Performance changes detected"));
    }

    console.log(chalk.blue("\n📋 Change Categories:"));
    for (const category of result.categories) {
      const impactColor = category.impact === "high" ? "red" : category.impact === "medium" ? "yellow" : "green";
      console.log(chalk[impactColor](`  ${category.type}: ${category.description}`));
    }
  }
}
