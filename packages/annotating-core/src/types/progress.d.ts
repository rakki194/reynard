/**
 * Progress tracking interfaces for Reynard annotation system
 *
 * This module defines interfaces for tracking annotation
 * progress and batch operations.
 */
export interface AnnotationProgress {
    total: number;
    completed: number;
    failed: number;
    progress: number;
    startTime: Date;
    estimatedTimeRemaining?: number;
    current?: string;
    batchProgress?: BatchProgress;
}
export interface BatchProgress {
    currentBatch: number;
    totalBatches: number;
    batchSize: number;
    itemsInCurrentBatch: number;
}
