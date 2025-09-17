/**
 * Single Caption Processing Service
 *
 * Handles individual caption generation with event tracking.
 */

import { CaptionTask, CaptionResult, ErrorType } from "../types/index.js";
import { CaptionApiClient, CaptionRequest } from "../clients/index.js";
import { SimpleEventManager } from "./EventManager.js";

export class SingleCaptionProcessor {
  constructor(
    private client: CaptionApiClient,
    private eventManager: SimpleEventManager
  ) {}

  async processCaption(task: CaptionTask): Promise<CaptionResult> {
    try {
      this.eventManager.emitEvent({
        type: "caption_started",
        timestamp: new Date(),
        data: { task },
      });

      const request: CaptionRequest = {
        image_path: task.imagePath,
        generator_name: task.generatorName,
        config: task.config,
        force: task.force,
        post_process: task.postProcess,
      };

      const response = await this.client.generateCaption(request);

      const result: CaptionResult = {
        imagePath: response.image_path,
        generatorName: response.generator_name,
        success: response.success,
        caption: response.caption,
        error: response.error,
        errorType: response.error_type as any,
        retryable: response.retryable,
        processingTime: response.processing_time,
        captionType: response.caption_type as any,
        timestamp: new Date(),
      };

      this.eventManager.emitEvent({
        type: "caption_completed",
        timestamp: new Date(),
        data: { task, result },
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      this.eventManager.emitEvent({
        type: "caption_failed",
        timestamp: new Date(),
        data: { task, error: errorMessage },
      });

      return {
        imagePath: task.imagePath,
        generatorName: task.generatorName,
        success: false,
        error: errorMessage,
        errorType: ErrorType.NETWORK,
        retryable: true,
        timestamp: new Date(),
      };
    }
  }
}
