/**
 * RAG (Retrieval-Augmented Generation) composable for Reynard API
 */
import type { RAGQueryRequest, RAGQueryResponse, RAGStatsResponse } from "../generated/index.js";
export interface UseRAGOptions {
  basePath?: string;
}
export declare function useRAG(options?: UseRAGOptions): {
  isLoading: import("solid-js").Accessor<boolean>;
  query: (request: RAGQueryRequest) => Promise<RAGQueryResponse>;
  getDocuments: () => Promise<any[]>;
  getStats: () => Promise<RAGStatsResponse>;
};
