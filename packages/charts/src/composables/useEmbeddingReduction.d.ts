/**
 * Embedding Reduction Composable
 *
 * Handles dimensionality reduction operations.
 */
export interface EmbeddingReductionState {
    reductionMethod: () => "pca" | "tsne" | "umap";
    reductionParams: () => Record<string, unknown>;
    maxSamples: () => number;
    reductionResult: () => unknown;
    isLoading: () => boolean;
    error: () => string;
}
export interface EmbeddingReductionActions {
    setReductionMethod: (method: "pca" | "tsne" | "umap") => void;
    setMaxSamples: (samples: number) => void;
    updateReductionParams: (key: string, value: unknown) => void;
    performReduction: () => Promise<void>;
}
export declare function useEmbeddingReduction(): EmbeddingReductionState & EmbeddingReductionActions;
