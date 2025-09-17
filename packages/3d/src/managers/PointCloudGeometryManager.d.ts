import type { EmbeddingPoint, EmbeddingRenderingConfig, GeometryManager, GeometryLike, BufferGeometryLike, ThreeJSInterface } from "../types/rendering";
export declare class PointCloudGeometryManager implements GeometryManager {
    threeJS: ThreeJSInterface;
    private geometryCache;
    private disposedGeometries;
    constructor(threeJS: ThreeJSInterface);
    createPointGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): GeometryLike;
    private createStandardGeometry;
    private createInstancedGeometry;
    createThumbnailGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): BufferGeometryLike;
    createTextGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): BufferGeometryLike;
    updateGeometry(geometry: GeometryLike, points: EmbeddingPoint[], config: EmbeddingRenderingConfig): void;
    disposeGeometry(geometry: GeometryLike): void;
    disposeAllGeometries(): void;
    /**
     * Get cached geometry or create new one
     */
    getOrCreatePointGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): GeometryLike;
    /**
     * Get geometry statistics
     */
    getStats(): {
        cached: number;
        disposed: number;
    };
    /**
     * Clean up disposed geometries from memory
     */
    cleanup(): void;
}
