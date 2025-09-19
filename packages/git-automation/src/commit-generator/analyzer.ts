/**
 * 🦊 Commit Message Analyzer
 *
 * Analyzes change data to determine commit message components
 */

import type { ChangeAnalysisResult, ChangeCategory, FileChange } from "../change-analyzer/types";

export class CommitMessageAnalyzer {
  /**
   * Determine primary type and scope from analysis
   */
  determineTypeAndScope(analysis: ChangeAnalysisResult): { type: string; scope?: string } {
    const categories = analysis.categories;

    // Check for breaking changes first
    if (analysis.hasBreakingChanges) {
      return { type: "feat", scope: "breaking" };
    }

    // Check for security changes
    if (analysis.securityChanges) {
      return { type: "fix", scope: "security" };
    }

    // Check for performance changes
    if (analysis.performanceChanges) {
      return { type: "perf", scope: "performance" };
    }

    // Determine primary category
    const primaryCategory = this.getPrimaryCategory(categories);

    switch (primaryCategory.type) {
      case "feature":
        return { type: "feat", scope: this.getScopeFromFiles(primaryCategory.files) };
      case "fix":
        return { type: "fix", scope: this.getScopeFromFiles(primaryCategory.files) };
      case "docs":
        return { type: "docs", scope: this.getScopeFromFiles(primaryCategory.files) };
      case "refactor":
        return { type: "refactor", scope: this.getScopeFromFiles(primaryCategory.files) };
      case "test":
        return { type: "test", scope: this.getScopeFromFiles(primaryCategory.files) };
      case "chore":
        return { type: "chore", scope: this.getScopeFromFiles(primaryCategory.files) };
      case "perf":
        return { type: "perf", scope: this.getScopeFromFiles(primaryCategory.files) };
      case "style":
        return { type: "style", scope: this.getScopeFromFiles(primaryCategory.files) };
      default:
        return { type: "feat", scope: undefined };
    }
  }

  /**
   * Generate description from analysis
   */
  generateDescription(analysis: ChangeAnalysisResult, _type: string): string {
    const categories = analysis.categories;

    if (categories.length === 1) {
      const category = categories[0];
      return this.getCategoryDescription(category.type, category.files.length);
    }

    if (categories.length <= 3) {
      const types = categories.map(c => c.type).join(", ");
      return `update ${types} across ${analysis.totalFiles} files`;
    }

    return `update ${analysis.totalFiles} files across multiple categories`;
  }

  /**
   * Generate body content
   */
  generateBody(analysis: ChangeAnalysisResult, maxLength: number): string {
    const lines: string[] = [];

    // Add summary
    lines.push(`Changes across ${analysis.totalFiles} files:`);
    lines.push(`- ${analysis.totalAdditions} additions`);
    lines.push(`- ${analysis.totalDeletions} deletions`);
    lines.push("");

    // Add categories
    for (const category of analysis.categories) {
      const emoji = this.getCategoryEmoji(category.type);
      lines.push(`${emoji} ${category.type}: ${category.files.length} files`);

      // Add file list if not too long
      if (category.files.length <= 5) {
        for (const file of category.files) {
          lines.push(`  - ${file.file}`);
        }
      } else {
        lines.push(
          `  - ${category.files
            .slice(0, 3)
            .map(f => f.file)
            .join(", ")} and ${category.files.length - 3} more`
        );
      }
      lines.push("");
    }

    const body = lines.join("\n");

    // Truncate if too long
    if (body.length > maxLength) {
      return body.substring(0, maxLength - 3) + "...";
    }

    return body;
  }

  /**
   * Generate footer content
   */
  generateFooter(analysis: ChangeAnalysisResult): string {
    const lines: string[] = [];

    if (analysis.hasBreakingChanges) {
      lines.push("BREAKING CHANGE: This commit contains breaking changes");
    }

    if (analysis.securityChanges) {
      lines.push("Security: This commit addresses security vulnerabilities");
    }

    if (analysis.performanceChanges) {
      lines.push("Performance: This commit includes performance improvements");
    }

    return lines.join("\n");
  }

  private getPrimaryCategory(categories: ChangeCategory[]): ChangeCategory {
    // Sort by impact and file count
    return categories.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) return impactDiff;
      return b.files.length - a.files.length;
    })[0];
  }

  private getScopeFromFiles(files: FileChange[]): string | undefined {
    if (files.length === 0) return undefined;

    // Try to extract common scope from file paths
    const paths = files.map(f => f.file.split("/"));
    const commonPrefix = this.findCommonPrefix(paths);

    if (commonPrefix && commonPrefix.length > 0) {
      return commonPrefix[0];
    }

    return undefined;
  }

  private findCommonPrefix(paths: string[][]): string[] {
    if (paths.length === 0) return [];

    const firstPath = paths[0];
    const prefix: string[] = [];

    for (let i = 0; i < firstPath.length; i++) {
      const segment = firstPath[i];
      if (paths.every(path => path[i] === segment)) {
        prefix.push(segment);
      } else {
        break;
      }
    }

    return prefix;
  }

  private getCategoryDescription(type: string, count: number): string {
    const descriptions: Record<string, string> = {
      feature: `add new features`,
      fix: `fix issues`,
      docs: `update documentation`,
      refactor: `refactor code`,
      test: `add tests`,
      chore: `update configuration`,
      perf: `improve performance`,
      style: `update styling`,
    };

    const base = descriptions[type] || `update ${type}`;
    return count > 1 ? `${base} across ${count} files` : base;
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
