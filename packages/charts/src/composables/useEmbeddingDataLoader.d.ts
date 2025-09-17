/**
 * Embedding Data Loader Composable
 *
 * Handles loading and processing of embedding data.
 */
export interface EmbeddingDataLoaderState {
    embeddingData: () => unknown;
    pcaData: () => unknown;
    qualityData: () => unknown;
    isLoading: () => boolean;
    error: () => string;
}
export interface EmbeddingDataLoaderActions {
    loadEmbeddingData: () => Promise<void>;
}
export declare function useEmbeddingDataLoader(): EmbeddingDataLoaderState & EmbeddingDataLoaderActions;
