export interface EmbeddingPoint {
    id: string;
    position: [number, number, number];
    color?: [number, number, number];
    size?: number;
    metadata?: Record<string, unknown>;
    importance?: number;
    confidence?: number;
    clusterId?: string;
    similarity?: number;
    imageUrl?: string;
    imageThumbnail?: string;
    textContent?: string;
    contentType?: "image" | "text" | "mixed";
    thumbnailDataUrl?: string;
    originalEmbedding?: number[];
    reducedEmbedding?: number[];
}
export interface EmbeddingRenderingConfig {
    pointSize: number;
    colorMapping: "similarity" | "cluster" | "importance" | "confidence" | "custom";
    sizeMapping: "importance" | "confidence" | "uniform";
    enableInstancing: boolean;
    enableLOD: boolean;
    enableCulling: boolean;
    lodDistance: number;
    lodLevels: number;
    maxPoints: number;
    enableThumbnails: boolean;
    enableTextSprites: boolean;
    thumbnailSize: number;
    textSpriteSize: number;
    enableHighlighting: boolean;
    highlightColor: [number, number, number];
    highlightSize: number;
    enableAnimations: boolean;
    animationDuration: number;
    animationEasing: "linear" | "easeInQuad" | "easeOutQuad" | "easeInOutQuad" | "easeInCubic" | "easeOutCubic" | "easeInOutCubic" | "easeInElastic" | "easeOutElastic" | "easeInOutElastic";
    enableSearchHighlighting: boolean;
    searchResultColor: [number, number, number];
    searchResultSize: number;
    enableSimilarityPaths: boolean;
    similarityPathColor: [number, number, number];
    similarityPathWidth: number;
    enableClustering: boolean;
    clusterColors: [number, number, number][];
    clusterOpacity: number;
    clusterOutlineColor: [number, number, number];
    clusterOutlineWidth: number;
}
export interface ClusterData {
    id: string;
    points: Vector3Like[];
    centroid: Vector3Like;
    color: ColorLike;
    label: string;
    statistics: {
        size: number;
        density: number;
        variance: number;
        averageSimilarity: number;
    };
}
export interface Vector3Like {
    x: number;
    y: number;
    z: number;
    set: (x: number, y: number, z: number) => Vector3Like;
    setScalar: (scalar: number) => Vector3Like;
}
export interface ColorLike {
    r: number;
    g: number;
    b: number;
}
export interface Vector2Like {
    x: number;
    y: number;
}
