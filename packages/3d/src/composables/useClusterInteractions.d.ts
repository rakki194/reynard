import type { RendererLike, CameraLike } from "../types/threejs";
interface ThreeMesh {
    id?: string;
    position?: {
        set: (x: number, y: number, z: number) => void;
    };
    rotation?: {
        set: (x: number, y: number, z: number) => void;
    };
    scale?: {
        set: (x: number, y: number, z: number) => void;
    };
    visible?: boolean;
    castShadow?: boolean;
    receiveShadow?: boolean;
    geometry?: unknown;
    material?: unknown;
    userData?: Record<string, unknown>;
}
export interface ClusterInteractionConfig {
    renderer: RendererLike;
    camera: CameraLike;
    hullMeshes: ThreeMesh[];
    onClusterSelect?: (clusterId: string) => void;
}
export declare function useClusterInteractions(config: ClusterInteractionConfig): {
    hoveredCluster: import("solid-js").Accessor<string | null>;
    setHoveredCluster: import("solid-js").Setter<string | null>;
};
export {};
