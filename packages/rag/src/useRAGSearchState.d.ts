/**
 * RAG Search State Composable
 *
 * Manages state and operations for the RAG search component
 * following Reynard composable conventions.
 */
import type { RAGQueryParams } from "./rag-types";
import { RAGApiService } from "./api-service";
import type { RAGResult, RAGDocument, RAGStats, RAGQueryResponse } from "./types";
export interface RAGSearchStateConfig {
    apiService: RAGApiService;
    defaultModel: string;
    maxResults: number;
    similarityThreshold: number;
    enableReranking: boolean;
}
export declare function useRAGSearchState(config: RAGSearchStateConfig): {
    rag: {
        config: import("solid-js").Resource<import("./rag-types").RAGConfig>;
        indexingStatus: import("solid-js").Resource<import("./rag-types").RAGIndexingStatus>;
        metrics: import("solid-js").Resource<import("./rag-types").RAGMetrics>;
        refreshStatus: () => void;
        refreshConfig: (info?: unknown) => import("./rag-types").RAGConfig | Promise<import("./rag-types").RAGConfig | undefined> | null | undefined;
        query: <TExtra = Record<string, unknown>>(params: RAGQueryParams, signal?: globalThis.AbortSignal) => Promise<import("./rag-types").RAGQueryResponse<TExtra>>;
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
    documents: import("solid-js").Accessor<RAGDocument[]>;
    stats: import("solid-js").Accessor<RAGStats | null>;
    error: import("solid-js").Accessor<string | null>;
    query: import("solid-js").Accessor<string>;
    setQuery: import("solid-js").Setter<string>;
    results: import("solid-js").Accessor<RAGResult[]>;
    isSearching: import("solid-js").Accessor<boolean>;
    queryTime: import("solid-js").Accessor<number | null>;
    embeddingModel: import("solid-js").Accessor<string>;
    setEmbeddingModel: import("solid-js").Setter<string>;
    maxResults: import("solid-js").Accessor<number>;
    setMaxResults: import("solid-js").Setter<number>;
    similarityThreshold: import("solid-js").Accessor<number>;
    setSimilarityThreshold: import("solid-js").Setter<number>;
    enableReranking: import("solid-js").Accessor<boolean>;
    setEnableReranking: import("solid-js").Setter<boolean>;
    isUploading: import("solid-js").Accessor<boolean>;
    uploadProgress: import("solid-js").Accessor<number>;
    loadDocuments: () => Promise<void>;
    loadStats: () => Promise<void>;
    uploadFile: (file: File, basePath: string, onUpload?: (result: any) => void) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
    search: (searchQuery: string) => Promise<void>;
    legacyResults: () => RAGResult[];
    queryResponse: () => RAGQueryResponse | null;
};
