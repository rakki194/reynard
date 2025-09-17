/**
 * Batch Processing Service
 *
 * Handles batch caption generation with progress tracking.
 */
export class BatchProcessor {
    constructor(client, eventManager) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: client
        });
        Object.defineProperty(this, "eventManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventManager
        });
    }
    async processBatch(tasks, progressCallback) {
        const startTime = new Date();
        const total = tasks.length;
        let completed = 0;
        let failed = 0;
        try {
            this.eventManager.emitEvent({
                type: "batch_started",
                timestamp: new Date(),
                data: {
                    totalTasks: total,
                    completedTasks: 0,
                    failedTasks: 0,
                    progress: 0,
                },
            });
            const request = {
                tasks: tasks.map((task) => ({
                    image_path: task.imagePath,
                    generator_name: task.generatorName,
                    config: task.config,
                    force: task.force,
                    post_process: task.postProcess,
                })),
            };
            const responses = await this.client.generateBatchCaptions(request);
            const results = responses.map((response, index) => {
                const task = tasks[index];
                const result = {
                    imagePath: response.image_path,
                    generatorName: response.generator_name,
                    success: response.success,
                    caption: response.caption,
                    error: response.error,
                    errorType: response.error_type,
                    retryable: response.retryable,
                    processingTime: response.processing_time,
                    captionType: response.caption_type,
                    timestamp: new Date(),
                };
                if (result.success) {
                    completed++;
                }
                else {
                    failed++;
                }
                // Report progress
                if (progressCallback) {
                    const progress = {
                        total,
                        completed: completed + failed,
                        failed,
                        progress: ((completed + failed) / total) * 100,
                        startTime,
                        current: task.imagePath,
                    };
                    progressCallback(progress);
                }
                return result;
            });
            this.eventManager.emitEvent({
                type: "batch_completed",
                timestamp: new Date(),
                data: {
                    totalTasks: total,
                    completedTasks: completed,
                    failedTasks: failed,
                    progress: 100,
                },
            });
            return results;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            this.eventManager.emitEvent({
                type: "batch_failed",
                timestamp: new Date(),
                data: {
                    totalTasks: total,
                    completedTasks: completed,
                    failedTasks: failed,
                    progress: 0,
                },
            });
            // Return error results for all tasks
            return tasks.map((task) => ({
                imagePath: task.imagePath,
                generatorName: task.generatorName,
                success: false,
                error: errorMessage,
                errorType: "network",
                retryable: true,
                timestamp: new Date(),
            }));
        }
    }
}
