import { RAGConfig, RAGClientOptions } from "./rag-types";
/**
 * Creates a RAG config client for configuration management
 *
 * @param authFetch Authenticated fetch function
 * @param configUrl Config endpoint URL
 * @returns Config client with get/update capabilities
 */
export declare function createRAGConfigClient(authFetch: RAGClientOptions["authFetch"], configUrl: string): {
    getConfig: () => Promise<RAGConfig>;
    updateConfig: (config: Partial<RAGConfig>) => Promise<void>;
};
