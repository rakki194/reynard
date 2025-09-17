/**
 * Backend API service for caption generation
 */

import type { CaptionResult, SystemStatistics } from "../types";

export class CaptionApiService {
  constructor(private backendUrl: string) {}

  /**
   * Test backend connection and health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get system statistics from backend
   */
  async getSystemStats(): Promise<SystemStatistics | null> {
    try {
      const response = await fetch(`${this.backendUrl}/api/caption/stats`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate caption for a single image
   */
  async generateCaption(
    file: File,
    generatorName: string,
    config: Record<string, any> = { threshold: 0.2, max_tags: 15 }
  ): Promise<CaptionResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("generator_name", generatorName);
    formData.append("config", JSON.stringify(config));
    formData.append("post_process", "true");

    const response = await fetch(`${this.backendUrl}/api/caption/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Generate captions for multiple images
   */
  async batchGenerateCaptions(
    files: File[],
    generatorName: string,
    config: Record<string, any> = { threshold: 0.2 }
  ): Promise<CaptionResult[]> {
    const results: CaptionResult[] = [];

    for (const file of files) {
      try {
        const result = await this.generateCaption(file, generatorName, config);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return results;
  }
}
