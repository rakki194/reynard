/**
 * Generator registry for thumbnail generation.
 *
 * Manages the creation and caching of thumbnail generators
 * based on file categories and options.
 */
import { ThumbnailOptions } from "../../types";
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
export declare class GeneratorRegistry {
    private generators;
    /**
     * Get appropriate generator for file category
     */
    getGenerator(category: string, options: GeneratorRegistryOptions): ThumbnailGenerator | null;
    /**
     * Create a new generator instance for the given category
     */
    private createGenerator;
    /**
     * Clean up all cached generators
     */
    destroy(): void;
}
