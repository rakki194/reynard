/**
 * 3D Visualization Data Composable
 *
 * Manages embedding data transformation, dimensionality reduction,
 * and point cloud generation for 3D visualization.
 */
import type { RAGQueryHit, EmbeddingPoint } from "../types";
export interface VisualizationDataState {
    transformedData: number[][];
    originalIndices: number[];
    isLoading: boolean;
    error: string | null;
}
export declare function use3DVisualizationData(searchResults: () => RAGQueryHit[], queryEmbedding: () => number[] | undefined, reductionMethod: () => "tsne" | "umap" | "pca", pointSize: () => number): {
    transformedData: import("solid-js").Accessor<number[][]>;
    originalIndices: import("solid-js").Accessor<number[]>;
    isLoading: import("solid-js").Accessor<boolean>;
    error: import("solid-js").Accessor<string | null>;
    embeddingPoints: import("solid-js").Accessor<EmbeddingPoint[]>;
    loadEmbeddingData: () => Promise<void>;
};
