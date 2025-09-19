/**
 * 🦊 Change Analyzer Types
 *
 * Type definitions for the change analyzer module
 */

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
