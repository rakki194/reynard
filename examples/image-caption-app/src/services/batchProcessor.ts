/**
 * Batch processing service for caption generation
 */

import type { ImageItem, CaptionResult, BatchProgress } from "../types";
import { CaptionApiService } from "./api";

export class BatchProcessor {
  constructor(private apiService: CaptionApiService) {}

  /**
   * Process multiple images for caption generation with progress tracking
   */
  async processBatch(
    images: ImageItem[],
    generatorName: string,
    onProgress: (progress: BatchProgress) => void,
  ): Promise<CaptionResult[]> {
    const imagesToProcess = images.filter((img) => !img.caption);
    const results: CaptionResult[] = [];
    let completed = 0;

    for (const img of imagesToProcess) {
      try {
        const result = await this.apiService.generateCaption(
          img.file,
          generatorName,
          { threshold: 0.2 },
        );
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: (error as Error).message,
        });
      }

      completed++;
      const progress = (completed / imagesToProcess.length) * 100;

      onProgress({
        total: imagesToProcess.length,
        completed,
        progress,
        current: img.name,
      });
    }

    return results;
  }

  /**
   * Update images with batch processing results
   */
  updateImagesWithResults(
    images: ImageItem[],
    results: CaptionResult[],
    generatorName: string,
  ): ImageItem[] {
    return images.map((img) => {
      const result = results.find((r) => r.image_path === img.name);
      if (result && result.success) {
        const extractedTags =
          result.caption?.split(/[,\s]+/).filter((tag) => tag.length > 2) || [];
        return {
          ...img,
          caption: result.caption,
          tags: extractedTags,
          generatedAt: new Date(),
          model: generatorName,
        };
      }
      return img;
    });
  }

  /**
   * Get success count from results
   */
  getSuccessCount(results: CaptionResult[]): number {
    return results.filter((r) => r.success).length;
  }
}
