import { RAGConfig } from "./rag-types";
/**
 * Creates auto-refresh functionality for RAG status and metrics
 *
 * @param config RAG config resource
 * @param refetchIndexingStatus Function to refetch indexing status
 * @param refetchMetrics Function to refetch metrics
 * @returns Auto-refresh controls
 */
export declare function createRAGAutoRefresh(config: () => RAGConfig | undefined, refetchIndexingStatus: () => void, refetchMetrics: () => void): {
    statusRefreshInterval: import("solid-js").Accessor<NodeJS.Timeout | null>;
    setStatusRefreshInterval: import("solid-js").Setter<NodeJS.Timeout | null>;
};
