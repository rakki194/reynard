/**
 * Generator registry for thumbnail generation.
 *
 * Manages the creation and caching of thumbnail generators
 * based on file categories and options.
 */

import { ThumbnailOptions } from "../../types";
import { ImageThumbnailGenerator } from "../ImageThumbnailGenerator";
import { VideoThumbnailGenerator } from "../VideoThumbnailGenerator";
import { AudioThumbnailGenerator } from "../AudioThumbnailGenerator";
import { DocumentThumbnailGenerator } from "../DocumentThumbnailGenerator";

export interface ThumbnailGenerator {
  generateThumbnail(file: File | string, options: ThumbnailOptions): Promise<any>;
  destroy?(): void;
}

export interface GeneratorRegistryOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for transparent images */
  backgroundColor?: string;
}

export class GeneratorRegistry {
  private generators = new Map<string, ThumbnailGenerator>();

  /**
   * Get appropriate generator for file category
   */
  getGenerator(category: string, options: GeneratorRegistryOptions): ThumbnailGenerator | null {
    const cacheKey = `${category}-${JSON.stringify(options)}`;

    if (this.generators.has(cacheKey)) {
      return this.generators.get(cacheKey)!;
    }

    const generator = this.createGenerator(category, options);
    if (generator) {
      this.generators.set(cacheKey, generator);
    }

    return generator;
  }

  /**
   * Create a new generator instance for the given category
   */
  private createGenerator(category: string, options: GeneratorRegistryOptions): ThumbnailGenerator | null {
    switch (category) {
      case "image":
        return new ImageThumbnailGenerator(options);
      case "video":
        return new VideoThumbnailGenerator(options);
      case "audio":
        return new AudioThumbnailGenerator(options);
      case "text":
      case "code":
      case "document":
        return new DocumentThumbnailGenerator(options);
      default:
        return null;
    }
  }

  /**
   * Clean up all cached generators
   */
  destroy(): void {
    this.generators.forEach(generator => {
      if (generator && typeof generator.destroy === "function") {
        generator.destroy();
      }
    });
    this.generators.clear();
  }
}
