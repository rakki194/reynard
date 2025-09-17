/**
 * Progress management utilities for file processing operations.
 *
 * Handles progress tracking and callback management for long-running
 * file processing tasks.
 */
import { ProcessingProgress } from "../../types";
export declare class ProgressManager {
    private progressCallbacks;
    /**
     * Add progress callback
     */
    onProgress(callback: (progress: ProcessingProgress) => void): void;
    /**
     * Remove progress callback
     */
    offProgress(callback: (progress: ProcessingProgress) => void): void;
    /**
     * Update progress and notify callbacks
     */
    updateProgress(progress: ProcessingProgress): void;
    /**
     * Create progress update for file processing
     */
    createFileProgress(operation: string, currentIndex: number, totalFiles: number, currentFile?: string, status?: string): ProcessingProgress;
    /**
     * Create completion progress update
     */
    createCompletionProgress(operation: string, totalFiles: number): ProcessingProgress;
    /**
     * Clear all progress callbacks
     */
    clearCallbacks(): void;
    /**
     * Get number of active callbacks
     */
    getCallbackCount(): number;
}
