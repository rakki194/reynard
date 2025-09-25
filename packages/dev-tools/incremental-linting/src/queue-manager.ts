/**
 * 🦊 Reynard Linting Queue Manager
 * ================================
 *
 * Specialized queue manager for linting operations.
 * Extends the base queue-watcher functionality.
 */

import { FileQueueManager } from "reynard-queue-watcher";
import type { LintingProcessor, LintResult, LintingQueueStatus } from "./types.js";

/**
 * Linting-specific queue manager
 */
export class LintingQueueManager extends FileQueueManager {
  private lintingStats: {
    totalFiles: number;
    filesWithIssues: number;
    totalIssues: number;
    averageLintTime: number;
    totalLintTime: number;
  } = {
    totalFiles: 0,
    filesWithIssues: 0,
    totalIssues: 0,
    averageLintTime: 0,
    totalLintTime: 0,
  };

  constructor(options: any = {}) {
    super(options);
  }

  /**
   * Register a linting processor
   */
  registerLintingProcessor(_name: string, _processor: LintingProcessor, _options: any = {}): void {
    // Store processor for later use - queue manager doesn't have registerProcessor method
    // This would need to be implemented differently based on the actual queue manager API
  }

  /**
   * Get linting-specific status
   */
  getLintingStatus(): LintingQueueStatus {
    const baseStatus = this.getStatus();

    return {
      ...baseStatus,
      isRunning: baseStatus.isProcessing,
      totalFiles: this.lintingStats.totalFiles,
      filesWithIssues: this.lintingStats.filesWithIssues,
      activeFiles: 0, // Would be tracked by queue manager
      queuedFiles: 0,
      failedFiles: 0,
      passedFiles: 0,
      totalIssues: this.lintingStats.totalIssues,
      issuesBySeverity: {
        error: 0,
        warning: 0,
        info: 0,
        hint: 0,
      },
      averageLintTime: this.lintingStats.averageLintTime,
    };
  }

  /**
   * Update linting statistics
   */
  updateLintingStats(result: LintResult): void {
    this.lintingStats.totalFiles++;
    this.lintingStats.totalLintTime += result.duration;
    this.lintingStats.averageLintTime = this.lintingStats.totalLintTime / this.lintingStats.totalFiles;

    if (result.issues.length > 0) {
      this.lintingStats.filesWithIssues++;
      this.lintingStats.totalIssues += result.issues.length;
    }
  }

  /**
   * Reset linting statistics
   */
  resetLintingStats(): void {
    this.lintingStats = {
      totalFiles: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      averageLintTime: 0,
      totalLintTime: 0,
    };
  }
}
