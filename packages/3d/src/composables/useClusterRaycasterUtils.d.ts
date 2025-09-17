import type { CameraLike, RendererLike } from "../types/threejs";
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
export declare function setupClusterRaycaster(renderer: RendererLike, camera: CameraLike, hullMeshes: ThreeMesh[], setHoveredCluster: (clusterId: string | null) => void, onClusterSelect?: (clusterId: string) => void): Promise<() => void>;
export {};
