/**
 * 3D Visualization Parameters Composable
 *
 * Manages all parameter state for 3D embedding visualization
 * including reduction methods, algorithm parameters, and display settings.
 */
export interface TsneParams {
    perplexity: number;
    learning_rate: number;
    early_exaggeration: number;
    max_iter: number;
    metric: string;
    method: string;
}
export interface UmapParams {
    n_neighbors: number;
    min_dist: number;
    learning_rate: number;
    spread: number;
    metric: string;
    local_connectivity: number;
}
export interface PcaParams {
    n_components: number;
    variance_threshold: number;
    whiten: boolean;
    svd_solver: string;
}
export interface VisualizationSettings {
    pointSize: number;
    enableHighlighting: boolean;
    showSimilarityPaths: boolean;
    showSimilarityRadius: boolean;
    radiusThreshold: number;
}
export declare function use3DVisualizationParams(): {
    reductionMethod: import("solid-js").Accessor<"tsne" | "pca" | "umap">;
    setReductionMethod: import("solid-js").Setter<"tsne" | "pca" | "umap">;
    tsneParams: import("solid-js").Accessor<TsneParams>;
    setTsneParams: import("solid-js").Setter<TsneParams>;
    umapParams: import("solid-js").Accessor<UmapParams>;
    setUmapParams: import("solid-js").Setter<UmapParams>;
    pcaParams: import("solid-js").Accessor<PcaParams>;
    setPcaParams: import("solid-js").Setter<PcaParams>;
    pointSize: import("solid-js").Accessor<number>;
    setPointSize: import("solid-js").Setter<number>;
    enableHighlighting: import("solid-js").Accessor<boolean>;
    setEnableHighlighting: import("solid-js").Setter<boolean>;
    showSimilarityPaths: import("solid-js").Accessor<boolean>;
    setShowSimilarityPaths: import("solid-js").Setter<boolean>;
    showSimilarityRadius: import("solid-js").Accessor<boolean>;
    setShowSimilarityRadius: import("solid-js").Setter<boolean>;
    radiusThreshold: import("solid-js").Accessor<number>;
    setRadiusThreshold: import("solid-js").Setter<number>;
    showParameterControls: import("solid-js").Accessor<boolean>;
    setShowParameterControls: import("solid-js").Setter<boolean>;
};
