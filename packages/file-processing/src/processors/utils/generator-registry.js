/**
 * Generator registry for thumbnail generation.
 *
 * Manages the creation and caching of thumbnail generators
 * based on file categories and options.
 */
import { ImageThumbnailGenerator } from "../ImageThumbnailGenerator";
import { VideoThumbnailGenerator } from "../VideoThumbnailGenerator";
import { AudioThumbnailGenerator } from "../AudioThumbnailGenerator";
import { DocumentThumbnailGenerator } from "../DocumentThumbnailGenerator";
export class GeneratorRegistry {
    constructor() {
        Object.defineProperty(this, "generators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Get appropriate generator for file category
     */
    getGenerator(category, options) {
        const cacheKey = `${category}-${JSON.stringify(options)}`;
        if (this.generators.has(cacheKey)) {
            return this.generators.get(cacheKey);
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
    createGenerator(category, options) {
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
    destroy() {
        this.generators.forEach((generator) => {
            if (generator && typeof generator.destroy === "function") {
                generator.destroy();
            }
        });
        this.generators.clear();
    }
}
