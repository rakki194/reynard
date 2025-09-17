import type { ClusterData } from "../types/rendering";
export interface ClusterRendererConfig {
    scene: any;
    renderer: any;
    camera: any;
}
export declare class ClusterRenderer {
    private config;
    private hullMeshes;
    private textSprites;
    private THREE;
    constructor(config: ClusterRendererConfig);
    initialize(): Promise<void>;
    clearClusterVisualizations(): void;
    renderClusters(clusters: ClusterData[], onHover?: (clusterId: string) => void): Promise<void>;
    private createConvexHull;
    private createClusterLabel;
    getHullMeshes(): any[];
    dispose(): void;
}
