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

    // Handle empty analysis
    if (!categories || categories.length === 0) {
      return { type: "chore", scope: undefined };
    }

    // Check for breaking changes first
    if (analysis.hasBreakingChanges) {
      // Try to extract scope from files for breaking changes
      const scope = this.getScopeFromFiles(categories[0]?.files || []);
      return { type: "feat!", scope: scope || "breaking" };
    }

    // Check for security changes
    if (analysis.securityChanges) {
      return { type: "fix", scope: "security" };
    }

    // Check for performance changes
    if (analysis.performanceChanges) {
      return { type: "perf", scope: "perf" };
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
  generateDescription(analysis: ChangeAnalysisResult, type: string): string {
    const categories = analysis.categories;

    // Handle empty analysis
    if (!categories || categories.length === 0) {
      return this.getCategoryDescription(type, 0);
    }

    // Handle special cases
    if (analysis.hasBreakingChanges) {
      return "add new features and capabilities with breaking changes";
    }

    if (analysis.performanceChanges) {
      return "improve performance and optimization with performance enhancements";
    }

    if (categories.length === 1) {
      const category = categories[0];
      return this.getCategoryDescription(category.type, category.files.length);
    }

    if (categories.length <= 3) {
      // For multiple categories, prioritize the first one and include details
      const primaryCategory = categories[0];
      const primaryDescription = this.getCategoryDescription(primaryCategory.type, primaryCategory.files.length);

      // Add details about all categories
      const allDetails = categories.map(cat => {
        const verb = this.getCategoryVerb(cat.type);
        const categoryName = cat.type === "fix" ? "issue" : cat.type;
        return `${verb} ${cat.files.length} ${categoryName} files`;
      });

      return `${primaryDescription} and ${allDetails.join(", ")}`;
    }

    return `update ${analysis.totalFiles} files across multiple categories`;
  }

  /**
   * Generate body content
   */
  generateBody(analysis: ChangeAnalysisResult, maxLength: number): string {
    const lines: string[] = [];

    // Add categories with descriptions
    for (const category of analysis.categories) {
      // Add category description if available
      if (category.description) {
        lines.push(`- ${category.description}`);
      }

      // Add file list if not too long
      if (category.files.length <= 5) {
        for (const file of category.files) {
          lines.push(`- ${file.file}`);
        }
      } else {
        lines.push(
          `- ${category.files
            .slice(0, 3)
            .map(f => f.file)
            .join(", ")} and ${category.files.length - 3} more`
        );
      }
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

    // Add version bump info
    if (analysis.versionBumpType) {
      lines.push(`Version bump: ${analysis.versionBumpType}`);
    }

    // Add refs if available
    if (analysis.totalFiles > 0) {
      lines.push("Refs: #TODO");
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
      // If the common prefix is "src", look for the next meaningful segment
      if (commonPrefix[0] === "src" && commonPrefix.length > 1) {
        const nextSegment = commonPrefix[1];
        if (["components", "utils", "test", "docs", "config", "api", "__tests__"].includes(nextSegment)) {
          // Map __tests__ to test
          return nextSegment === "__tests__" ? "test" : nextSegment;
        }
      }

      // Map common prefixes to expected scopes
      const scopeMap: Record<string, string> = {
        src: "src",
        components: "components",
        utils: "utils",
        test: "test",
        docs: "docs",
        config: "config",
      };

      const prefix = commonPrefix[0];
      return scopeMap[prefix] || prefix;
    }

    // If no common prefix, try to extract from individual file paths
    for (const file of files) {
      const pathParts = file.file.split("/");

      // Check for config files at root level
      if (
        pathParts.length === 1 &&
        ["package.json", "tsconfig.json", "eslint.config.js", "vite.config.ts"].includes(pathParts[0])
      ) {
        return "config";
      }

      for (const part of pathParts) {
        if (["components", "utils", "test", "docs", "config", "__tests__"].includes(part)) {
          // Map __tests__ to test
          return part === "__tests__" ? "test" : part;
        }
      }
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
      feature: `add new features and capabilities`,
      fix: `fix bugs and resolve issues`,
      docs: `update documentation and guides`,
      refactor: `refactor code structure`,
      test: `enhance test coverage and quality`,
      chore: `update configuration and maintenance`,
      perf: `improve performance and optimization`,
      style: `update styling and formatting`,
    };

    const base = descriptions[type] || `update ${type}`;
    return count > 1 ? `${base} (${count} files)` : base;
  }

  private getCategoryVerb(type: string): string {
    const verbs: Record<string, string> = {
      feature: "enhanced",
      fix: "resolved",
      docs: "updated",
      refactor: "refactored",
      test: "improved",
      chore: "updated",
      perf: "optimized",
      style: "updated",
    };

    return verbs[type] || "updated";
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
