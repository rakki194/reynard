import type { EmbeddingPoint, EmbeddingRenderingConfig, SceneLike, CameraLike, RendererLike } from "../types/rendering";
export interface PointCloudCreationConfig {
    pointCloudRenderer: () => {
        createPointCloud: (points: EmbeddingPoint[], config: EmbeddingRenderingConfig, scene: SceneLike, onPointClick: (event: MouseEvent) => void) => Promise<unknown>;
        pointCloud: () => unknown;
    };
    pointCloudEvents: () => {
        handlePointClick: (event: MouseEvent, pointCloud: unknown, points: EmbeddingPoint[], camera: CameraLike, renderer: RendererLike, onPointSelect?: (pointId: string) => void) => void;
    };
    points: EmbeddingPoint[];
    config: EmbeddingRenderingConfig;
    scene: SceneLike;
    camera: CameraLike;
    renderer: RendererLike;
    onPointSelect?: (pointId: string) => void;
}
export declare function usePointCloudCreation(config: PointCloudCreationConfig): {
    createPointCloud: () => Promise<void>;
};
