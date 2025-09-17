/**
 * Single Caption Processing Service
 *
 * Handles individual caption generation with event tracking.
 */
import { CaptionTask, CaptionResult } from "../types/index.js";
import { CaptionApiClient } from "../clients/index.js";
import { SimpleEventManager } from "./EventManager.js";
export declare class SingleCaptionProcessor {
    private client;
    private eventManager;
    constructor(client: CaptionApiClient, eventManager: SimpleEventManager);
    processCaption(task: CaptionTask): Promise<CaptionResult>;
}
