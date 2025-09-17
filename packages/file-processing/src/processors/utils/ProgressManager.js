/**
 * Progress management utilities for file processing operations.
 *
 * Handles progress tracking and callback management for long-running
 * file processing tasks.
 */
export class ProgressManager {
    constructor() {
        Object.defineProperty(this, "progressCallbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    /**
     * Add progress callback
     */
    onProgress(callback) {
        this.progressCallbacks.push(callback);
    }
    /**
     * Remove progress callback
     */
    offProgress(callback) {
        const index = this.progressCallbacks.indexOf(callback);
        if (index > -1) {
            this.progressCallbacks.splice(index, 1);
        }
    }
    /**
     * Update progress and notify callbacks
     */
    updateProgress(progress) {
        this.progressCallbacks.forEach((callback) => {
            try {
                callback(progress);
            }
            catch (error) {
                console.warn("Progress callback error:", error);
            }
        });
    }
    /**
     * Create progress update for file processing
     */
    createFileProgress(operation, currentIndex, totalFiles, currentFile, status) {
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
    createCompletionProgress(operation, totalFiles) {
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
    clearCallbacks() {
        this.progressCallbacks = [];
    }
    /**
     * Get number of active callbacks
     */
    getCallbackCount() {
        return this.progressCallbacks.length;
    }
}
