import type { EmbeddingRenderingConfig, MaterialManager, MaterialLike, ThreeJSInterface } from "../types/rendering";
export declare class PointCloudMaterialManager implements MaterialManager {
    threeJS: ThreeJSInterface;
    private materialCache;
    private disposedMaterials;
    constructor(threeJS: ThreeJSInterface);
    createPointMaterial(config: EmbeddingRenderingConfig): MaterialLike;
    createThumbnailMaterial(config: EmbeddingRenderingConfig): MaterialLike;
    createTextMaterial(config: EmbeddingRenderingConfig): MaterialLike;
    updateMaterial(material: MaterialLike, config: EmbeddingRenderingConfig): void;
    disposeMaterial(material: MaterialLike): void;
    disposeAllMaterials(): void;
    /**
     * Get cached material or create new one
     */
    getOrCreatePointMaterial(config: EmbeddingRenderingConfig): MaterialLike;
    /**
     * Get material statistics
     */
    getStats(): {
        cached: number;
        disposed: number;
    };
    /**
     * Clean up disposed materials from memory
     */
    cleanup(): void;
}
