import type { SpriteLike, EmbeddingPoint, EmbeddingRenderingConfig } from "../types/rendering";
export declare function usePointCloudInitialization(): {
    isInitialized: import("solid-js").Accessor<boolean>;
    thumbnailSprites: import("solid-js").Accessor<SpriteLike[]>;
    textSprites: import("solid-js").Accessor<SpriteLike[]>;
    pointCloudRenderer: () => {
        materialManager: import("solid-js").Accessor<import("..").PointCloudMaterialManager>;
        geometryManager: import("solid-js").Accessor<import("..").PointCloudGeometryManager>;
        spriteManager: import("solid-js").Accessor<import("../managers/SpriteManager").SpriteManager>;
        pointCloud: import("solid-js").Accessor<import("..").PointsLike | null>;
        createPointCloud: (points: EmbeddingPoint[], config: EmbeddingRenderingConfig, scene: any, onPointClick: (event: MouseEvent) => void) => Promise<import("..").PointsLike>;
        clearPointCloud: (scene: any) => void;
        dispose: () => void;
    } | null;
    pointCloudEvents: () => {
        raycaster: import("solid-js").Accessor<import("..").RaycasterLike | null>;
        mouse: import("solid-js").Accessor<import("..").Vector2Like | null>;
        initializeRaycaster: (threeJS: unknown) => void;
        handlePointClick: (event: MouseEvent, pointCloud: import("..").PointsLike | null, points: EmbeddingPoint[], camera: unknown, renderer: unknown, onPointSelect?: (pointId: string) => void) => void;
        handlePointHover: (pointId: string, config: unknown) => void;
        handlePointLeave: (config: unknown) => void;
    } | null;
    initializeRenderer: (scene: any, camera: any, renderer: any, points: EmbeddingPoint[], config: EmbeddingRenderingConfig, onPointSelect?: (pointId: string) => void) => Promise<void>;
    clearScene: (scene: any) => void;
    dispose: () => void;
};
