/**
 * Embedding Dashboard Composable
 *
 * Manages state and logic for the embedding visualization dashboard.
 */
export interface EmbeddingDashboardState {
    activeTab: () => "distribution" | "pca" | "quality" | "3d";
    isLoading: () => boolean;
    error: () => string;
    embeddingData: () => unknown;
    pcaData: () => unknown;
    qualityData: () => unknown;
    reductionMethod: () => "pca" | "tsne" | "umap";
    reductionParams: () => Record<string, unknown>;
    maxSamples: () => number;
    reductionResult: () => unknown;
}
export interface EmbeddingDashboardActions {
    setActiveTab: (tab: "distribution" | "pca" | "quality" | "3d") => void;
    loadEmbeddingData: () => Promise<void>;
    performReduction: () => Promise<void>;
    updateReductionParams: (key: string, value: unknown) => void;
    setReductionMethod: (method: "pca" | "tsne" | "umap") => void;
    setMaxSamples: (samples: number) => void;
}
export declare function useEmbeddingDashboard(isVisible?: () => boolean): EmbeddingDashboardState & EmbeddingDashboardActions;
