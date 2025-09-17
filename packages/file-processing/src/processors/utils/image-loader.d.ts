/**
 * Image loading and caching utilities for thumbnail generation.
 */
export declare class ImageLoader {
    private imageCache;
    /**
     * Load image file with caching
     */
    loadImage(file: File | string): Promise<HTMLImageElement>;
    /**
     * Clear image cache
     */
    clearCache(): void;
    /**
     * Get cache size
     */
    getCacheSize(): number;
}
