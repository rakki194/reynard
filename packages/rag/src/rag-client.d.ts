import { RAGClientOptions } from "./rag-types";
/**
 * Creates a RAG client for querying and ingesting documents
 *
 * @param options Configuration options including authFetch function
 * @returns RAG client with query, ingest, and admin capabilities
 */
export declare function createRAGClient(options: RAGClientOptions): {
    query: <TExtra = Record<string, unknown>>(params: import("./rag-types").RAGQueryParams, signal?: globalThis.AbortSignal) => Promise<import("./rag-types").RAGQueryResponse<TExtra>>;
    ingestDocuments: (items: import("./rag-types").RAGIngestItem[], model: string, onEvent?: (evt: import("./rag-types").RAGStreamEvent) => void, signal?: globalThis.AbortSignal) => Promise<void>;
    getConfig: () => Promise<import("./rag-types").RAGConfig>;
    updateConfig: (config: Partial<import("./rag-types").RAGConfig>) => Promise<void>;
    getIndexingStatus: () => Promise<import("./rag-types").RAGIndexingStatus>;
    getMetrics: () => Promise<import("./rag-types").RAGMetrics>;
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
