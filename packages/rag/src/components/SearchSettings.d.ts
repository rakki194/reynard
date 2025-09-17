/**
 * Search Settings Component
 *
 * Handles search configuration controls including embedding model,
 * max results, similarity threshold, and reranking options.
 */
export interface SearchSettingsProps {
    embeddingModel: string;
    onEmbeddingModelChange: (model: string) => void;
    maxResults: number;
    onMaxResultsChange: (maxResults: number) => void;
    similarityThreshold: number;
    onSimilarityThresholdChange: (threshold: number) => void;
    enableReranking: boolean;
    onEnableRerankingChange: (enabled: boolean) => void;
}
export declare function SearchSettings(props: SearchSettingsProps): any;
