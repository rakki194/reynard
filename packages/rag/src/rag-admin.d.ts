import { RAGIndexingStatus, RAGMetrics, RAGClientOptions } from "./rag-types";
/**
 * Creates a RAG admin client for administrative operations
 *
 * @param authFetch Authenticated fetch function
 * @param adminUrl Admin endpoint URL
 * @param metricsUrl Metrics endpoint URL
 * @returns Admin client with operational capabilities
 */
export declare function createRAGAdminClient(authFetch: RAGClientOptions["authFetch"], adminUrl: string, metricsUrl: string): {
    admin: {
        pause: () => Promise<any>;
        resume: () => Promise<any>;
        drain: () => Promise<any>;
        clearAllData: () => Promise<any>;
        status: () => Promise<any>;
        deadLetter: () => Promise<any>;
        requeueDeadLetter: () => Promise<any>;
    };
    getIndexingStatus: () => Promise<RAGIndexingStatus>;
    getMetrics: () => Promise<RAGMetrics>;
};
