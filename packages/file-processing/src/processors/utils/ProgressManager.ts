/**
 * Progress management utilities for file processing operations.
 *
 * Handles progress tracking and callback management for long-running
 * file processing tasks.
 */

import { ProcessingProgress } from "../../types";

export class ProgressManager {
  private progressCallbacks: ((progress: ProcessingProgress) => void)[] = [];

  /**
   * Add progress callback
   */
  onProgress(callback: (progress: ProcessingProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Remove progress callback
   */
  offProgress(callback: (progress: ProcessingProgress) => void): void {
    const index = this.progressCallbacks.indexOf(callback);
    if (index > -1) {
      this.progressCallbacks.splice(index, 1);
    }
  }

  /**
   * Update progress and notify callbacks
   */
  updateProgress(progress: ProcessingProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.warn("Progress callback error:", error);
      }
    });
  }

  /**
   * Create progress update for file processing
   */
  createFileProgress(
    operation: string,
    currentIndex: number,
    totalFiles: number,
    currentFile?: string,
    status?: string
  ): ProcessingProgress {
    return {
      operation,
      progress: (currentIndex / totalFiles) * 100,
      currentFile,
      totalFiles,
      processedFiles: currentIndex,
      status: status || `Processing ${currentIndex + 1} of ${totalFiles} files`,
    };
  }

  /**
   * Create completion progress update
   */
  createCompletionProgress(operation: string, totalFiles: number): ProcessingProgress {
    return {
      operation,
      progress: 100,
      currentFile: undefined,
      totalFiles,
      processedFiles: totalFiles,
      status: "Processing complete",
    };
  }

  /**
   * Clear all progress callbacks
   */
  clearCallbacks(): void {
    this.progressCallbacks = [];
  }

  /**
   * Get number of active callbacks
   */
  getCallbackCount(): number {
    return this.progressCallbacks.length;
  }
}
