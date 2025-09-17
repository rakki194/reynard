/**
 * RAG Search Component Composable
 *
 * Manages component initialization and setup for RAG search
 * following Reynard composable conventions.
 */
import type { RAGSearchProps } from "./types";
export interface RAGSearchComponentConfig {
    props: RAGSearchProps;
}
/**
 * Composable for managing RAG search component initialization and state
 *
 * @param config Component configuration
 * @returns Component state and handlers
 */
export declare function useRAGSearchComponent(config: RAGSearchComponentConfig): {
    ragState: {
        rag: {
            config: import("solid-js").Resource<import("./rag-types").RAGConfig>;
            indexingStatus: import("solid-js").Resource<import("./rag-types").RAGIndexingStatus>;
            metrics: import("solid-js").Resource<import("./rag-types").RAGMetrics>;
            refreshStatus: () => void;
            refreshConfig: (info?: unknown) => import("./rag-types").RAGConfig | Promise<import("./rag-types").RAGConfig | undefined> | null | undefined;
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
        documents: import("solid-js").Accessor<import("./types").RAGDocument[]>;
        stats: import("solid-js").Accessor<import("./types").RAGStats | null>;
        error: import("solid-js").Accessor<string | null>;
        query: import("solid-js").Accessor<string>;
        setQuery: import("solid-js").Setter<string>;
        results: import("solid-js").Accessor<import("./types").RAGResult[]>;
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
        legacyResults: () => import("./types").RAGResult[];
        queryResponse: () => import("./types").RAGQueryResponse | null;
    };
    handlers: {
        handleSearch: () => void;
        handleKeyPress: (e: KeyboardEvent) => void;
        handleResultClick: (result: import("./types").RAGResult) => void;
        handleFileSelect: (e: Event) => void;
    };
    activeTab: import("solid-js").Accessor<string>;
    setActiveTab: import("solid-js").Setter<string>;
};
