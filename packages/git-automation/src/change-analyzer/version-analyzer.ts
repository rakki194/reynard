/**
 * 🦊 Version Bump Analyzer
 *
 * Analyzes changes to determine appropriate version bump type
 */

import type { ChangeCategory, FileChange } from "./types";

export class VersionBumpAnalyzer {
  /**
   * Determine version bump type based on changes
   */
  determineVersionBump(categories: ChangeCategory[]): "major" | "minor" | "patch" {
    const hasBreakingChanges = this.detectBreakingChanges(categories);
    const hasNewFeatures = this.detectNewFeatures(categories);
    const hasFixes = this.detectFixes(categories);

    if (hasBreakingChanges) return "major";
    if (hasNewFeatures) return "minor";
    if (hasFixes) return "patch";

    return "patch"; // Default to patch for other changes
  }

  /**
   * Detect breaking changes
   */
  detectBreakingChanges(categories: ChangeCategory[]): boolean {
    return categories.some(
      category =>
        category.type === "refactor" && category.impact === "high" && this.hasBreakingChangeKeywords(category.files)
    );
  }

  /**
   * Detect new features
   */
  detectNewFeatures(categories: ChangeCategory[]): boolean {
    return categories.some(category => category.type === "feature" && category.impact !== "low");
  }

  /**
   * Detect fixes
   */
  detectFixes(categories: ChangeCategory[]): boolean {
    return categories.some(category => category.type === "fix" || category.type === "perf");
  }

  /**
   * Detect security changes
   */
  detectSecurityChanges(categories: ChangeCategory[]): boolean {
    return categories.some(
      category =>
        this.hasSecurityKeywords(category.files) ||
        (category.type === "fix" && this.hasSecurityKeywords(category.files))
    );
  }

  /**
   * Detect performance changes
   */
  detectPerformanceChanges(categories: ChangeCategory[]): boolean {
    return categories.some(category => category.type === "perf" || this.hasPerformanceKeywords(category.files));
  }

  private hasBreakingChangeKeywords(files: FileChange[]): boolean {
    const breakingKeywords = ["breaking", "deprecate", "remove", "delete", "rename"];
    return files.some(file => breakingKeywords.some(keyword => file.file.toLowerCase().includes(keyword)));
  }

  private hasSecurityKeywords(files: FileChange[]): boolean {
    const securityKeywords = ["security", "auth", "password", "token", "secret", "vulnerability"];
    return files.some(file => securityKeywords.some(keyword => file.file.toLowerCase().includes(keyword)));
  }

  private hasPerformanceKeywords(files: FileChange[]): boolean {
    const performanceKeywords = ["performance", "optimize", "cache", "memory", "speed"];
    return files.some(file => performanceKeywords.some(keyword => file.file.toLowerCase().includes(keyword)));
  }
}
