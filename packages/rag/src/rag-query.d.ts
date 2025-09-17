import { RAGQueryParams, RAGQueryResponse, RAGClientOptions } from "./rag-types";
/**
 * Creates a RAG query client for searching documents
 *
 * @param authFetch Authenticated fetch function
 * @param queryUrl Query endpoint URL
 * @returns Query client with search capabilities
 */
export declare function createRAGQueryClient(authFetch: RAGClientOptions["authFetch"], queryUrl: string): {
    query: <TExtra = Record<string, unknown>>(params: RAGQueryParams, signal?: globalThis.AbortSignal) => Promise<RAGQueryResponse<TExtra>>;
};
