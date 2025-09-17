import { createResource } from "solid-js";
import { createRAGClient } from "./rag-client";
// Re-export all types
export * from "./rag-types";
// Re-export the createRAGClient from the modular implementation
export { createRAGClient };
/**
 * RAG composable for SolidJS applications
 *
 * @param options Configuration options including authFetch function
 * @returns RAG client with reactive resources and utilities
 */
export function useRAG(options) {
    const client = createRAGClient(options);
    // Create reactive resources for config and status
    const [config, { refetch: refetchConfig }] = createResource(() => client.getConfig());
    const [indexingStatus, { refetch: refetchIndexingStatus }] = createResource(() => client.getIndexingStatus());
    const [metrics, { refetch: refetchMetrics }] = createResource(() => client.getMetrics());
    return {
        ...client,
        config,
        indexingStatus,
        metrics,
        refreshStatus: () => {
            refetchIndexingStatus();
            refetchMetrics();
        },
        refreshConfig: refetchConfig,
    };
}
