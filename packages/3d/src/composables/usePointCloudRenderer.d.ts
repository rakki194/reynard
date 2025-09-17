import type { ThreeJSInterface, PointsLike, EmbeddingRenderingConfig, EmbeddingPoint } from "../types/rendering";
import { PointCloudMaterialManager } from "../managers/PointCloudMaterialManager";
import { PointCloudGeometryManager } from "../managers/PointCloudGeometryManager";
import { SpriteManager } from "../managers/SpriteManager";
export declare function usePointCloudRenderer(threeJS: ThreeJSInterface): {
    materialManager: import("solid-js").Accessor<PointCloudMaterialManager>;
    geometryManager: import("solid-js").Accessor<PointCloudGeometryManager>;
    spriteManager: import("solid-js").Accessor<SpriteManager>;
    pointCloud: import("solid-js").Accessor<PointsLike | null>;
    createPointCloud: (points: EmbeddingPoint[], config: EmbeddingRenderingConfig, scene: any, onPointClick: (event: MouseEvent) => void) => Promise<PointsLike>;
    clearPointCloud: (scene: any) => void;
    dispose: () => void;
};
