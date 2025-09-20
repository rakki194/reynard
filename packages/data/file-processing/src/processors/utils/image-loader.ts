/**
 * Image loading and caching utilities for thumbnail generation.
 */

export class ImageLoader {
  private imageCache = new Map<string, HTMLImageElement>();

  /**
   * Load image file with caching
   */
  async loadImage(file: File | string): Promise<HTMLImageElement> {
    const key = typeof file === "string" ? file : file.name;

    if (this.imageCache.has(key)) {
      return this.imageCache.get(key)!;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    if (typeof file === "string") {
      image.src = file;
    } else {
      image.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    this.imageCache.set(key, image);
    return image;
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.imageCache.size;
  }
}
