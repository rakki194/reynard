/**
 * Image loading and caching utilities for thumbnail generation.
 */
export class ImageLoader {
    constructor() {
        Object.defineProperty(this, "imageCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Load image file with caching
     */
    async loadImage(file) {
        const key = typeof file === "string" ? file : file.name;
        if (this.imageCache.has(key)) {
            return this.imageCache.get(key);
        }
        const image = new Image();
        image.crossOrigin = "anonymous";
        if (typeof file === "string") {
            image.src = file;
        }
        else {
            image.src = URL.createObjectURL(file);
        }
        await new Promise((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("Failed to load image"));
        });
        this.imageCache.set(key, image);
        return image;
    }
    /**
     * Clear image cache
     */
    clearCache() {
        this.imageCache.clear();
    }
    /**
     * Get cache size
     */
    getCacheSize() {
        return this.imageCache.size;
    }
}
