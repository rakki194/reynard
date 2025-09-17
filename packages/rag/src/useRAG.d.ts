import { createRAGClient } from "./rag-client";
import type { RAGClientOptions, RAGConfig, RAGIndexingStatus, RAGMetrics, RAGQueryParams } from "./rag-types";
export * from "./rag-types";
export { createRAGClient };
/**
 * RAG composable for SolidJS applications
 *
 * @param options Configuration options including authFetch function
 * @returns RAG client with reactive resources and utilities
 */
export declare function useRAG(options: RAGClientOptions): {
    config: import("solid-js").Resource<RAGConfig>;
    indexingStatus: import("solid-js").Resource<RAGIndexingStatus>;
    metrics: import("solid-js").Resource<RAGMetrics>;
    refreshStatus: () => void;
    refreshConfig: (info?: unknown) => RAGConfig | Promise<RAGConfig | undefined> | null | undefined;
    query: <TExtra = Record<string, unknown>>(params: RAGQueryParams, signal?: globalThis.AbortSignal) => Promise<import("./rag-types").RAGQueryResponse<TExtra>>;
    ingestDocuments: (items: import("./rag-types").RAGIngestItem[], model: string, onEvent?: (evt: import("./rag-types").RAGStreamEvent) => void, signal?: globalThis.AbortSignal) => Promise<void>;
    getConfig: () => Promise<RAGConfig>;
    updateConfig: (config: Partial<RAGConfig>) => Promise<void>;
    getIndexingStatus: () => Promise<RAGIndexingStatus>;
    getMetrics: () => Promise<RAGMetrics>;
    admin: {
        pause: () => Promise<any>;
        resume: () => Promise<any>;
        drain: () => Promise<any>;
        clearAllData: () => Promise<any>;
        status: () => Promise<any>;
        deadLetter: () => Promise<any>;
        requeueDeadLetter: () => Promise<any>;
    };
};
