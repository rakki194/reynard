/**
 * Main application logic service
 */

import type { ImageItem, CaptionResult } from "../types";
import { CaptionApiService } from "./api";
import { BatchProcessor } from "./batchProcessor";

export class AppLogicService {
  private apiService: CaptionApiService;
  private batchProcessor: BatchProcessor;

  constructor(backendUrl: string) {
    this.apiService = new CaptionApiService(backendUrl);
    this.batchProcessor = new BatchProcessor(this.apiService);
  }

  /**
   * Initialize backend connection
   */
  async initializeBackend(): Promise<boolean> {
    try {
      const isHealthy = await this.apiService.checkHealth();
      if (!isHealthy) {
        throw new Error("Backend not responding");
      }
      return true;
    } catch (error) {
      console.error("Backend connection failed:", error);
      return false;
    }
  }

  /**
   * Update system statistics
   */
  async updateSystemStats(): Promise<any> {
    return await this.apiService.getSystemStats();
  }

  /**
   * Handle file upload and create image items
   */
  handleFileUpload(files: File[]): ImageItem[] {
    return files.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
  }

  /**
   * Generate caption for a single image
   */
  async generateCaption(
    image: ImageItem,
    generatorName: string,
  ): Promise<CaptionResult> {
    return await this.apiService.generateCaption(image.file, generatorName, {
      threshold: 0.2,
      max_tags: 15,
    });
  }

  /**
   * Process batch caption generation
   */
  async processBatch(
    images: ImageItem[],
    generatorName: string,
    onProgress: (progress: any) => void,
  ): Promise<CaptionResult[]> {
    return await this.batchProcessor.processBatch(
      images,
      generatorName,
      onProgress,
    );
  }

  /**
   * Update images with batch results
   */
  updateImagesWithResults(
    images: ImageItem[],
    results: CaptionResult[],
    generatorName: string,
  ): ImageItem[] {
    return this.batchProcessor.updateImagesWithResults(
      images,
      results,
      generatorName,
    );
  }

  /**
   * Get success count from results
   */
  getSuccessCount(results: CaptionResult[]): number {
    return this.batchProcessor.getSuccessCount(results);
  }

  /**
   * Delete image from collection
   */
  deleteImage(images: ImageItem[], imageId: string): ImageItem[] {
    return images.filter((img) => img.id !== imageId);
  }

  /**
   * Update image caption
   */
  updateImageCaption(
    images: ImageItem[],
    imageId: string,
    caption: string,
    tags: string[],
  ): ImageItem[] {
    return images.map((img) =>
      img.id === imageId ? { ...img, caption, tags } : img,
    );
  }
}
