/**
 * Batch Processing Service
 *
 * Handles batch caption generation with progress tracking.
 */
import { CaptionTask, CaptionResult, AnnotationProgress } from "../types/index.js";
import { CaptionApiClient } from "../clients/index.js";
import { SimpleEventManager } from "./EventManager.js";
export declare class BatchProcessor {
    private client;
    private eventManager;
    constructor(client: CaptionApiClient, eventManager: SimpleEventManager);
    processBatch(tasks: CaptionTask[], progressCallback?: (progress: AnnotationProgress) => void): Promise<CaptionResult[]>;
}
