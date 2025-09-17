import type { PointsLike, EmbeddingPoint } from "../types/rendering";
/**
 * Composable for managing point cloud event interactions
 * Orchestrates raycaster and interaction handlers
 */
export declare function usePointCloudEvents(): {
    raycaster: import("solid-js").Accessor<import("..").RaycasterLike | null>;
    mouse: import("solid-js").Accessor<import("..").Vector2Like | null>;
    initializeRaycaster: (threeJS: unknown) => void;
    handlePointClick: (event: MouseEvent, pointCloud: PointsLike | null, points: EmbeddingPoint[], camera: unknown, renderer: unknown, onPointSelect?: (pointId: string) => void) => void;
    handlePointHover: (pointId: string, config: unknown) => void;
    handlePointLeave: (config: unknown) => void;
};
