import { createSignal, createEffect, onCleanup } from "solid-js";
/**
 * Creates auto-refresh functionality for RAG status and metrics
 *
 * @param config RAG config resource
 * @param refetchIndexingStatus Function to refetch indexing status
 * @param refetchMetrics Function to refetch metrics
 * @returns Auto-refresh controls
 */
export function createRAGAutoRefresh(config, refetchIndexingStatus, refetchMetrics) {
    const [statusRefreshInterval, setStatusRefreshInterval] = createSignal(null);
    createEffect(() => {
        if (config()?.rag_enabled) {
            // Start auto-refresh when RAG is enabled
            const interval = setInterval(() => {
                try {
                    refetchIndexingStatus();
                    refetchMetrics();
                }
                catch (error) {
                    // Silently handle errors in auto-refresh to avoid console spam
                    console.debug("RAG auto-refresh error:", error);
                }
            }, 5000);
            setStatusRefreshInterval(interval);
            onCleanup(() => {
                if (interval)
                    clearInterval(interval);
            });
        }
        else {
            // Stop auto-refresh when RAG is disabled
            if (statusRefreshInterval()) {
                clearInterval(statusRefreshInterval());
                setStatusRefreshInterval(null);
            }
        }
    });
    return {
        statusRefreshInterval,
        setStatusRefreshInterval,
    };
}
