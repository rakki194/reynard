/**
 * RAG Search Composable
 *
 * Focused state management for search operations.
 * Extracted from useRAGSearchState.ts to follow the 140-line axiom.
 */
import { createSignal } from "solid-js";
import type { RAGResult, RAGQueryResponse, RAGModality } from "../types";
import { RAGApiService } from "../api-service";

export interface RAGSearchConfig {
  apiService: RAGApiService;
  maxResults: number;
  similarityThreshold: number;
  enableReranking: boolean;
}

export function useRAGSearch(config: RAGSearchConfig) {
  // Search state
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<RAGResult[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);
  const [queryTime, setQueryTime] = createSignal<number | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  // Search operations
  const performSearch = async (searchQuery: string, modality: RAGModality = "docs", topK?: number) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const startTime = performance.now();

      const response = await config.apiService.search(searchQuery, {
        modality,
        topK: topK || config.maxResults,
        similarity_threshold: config.similarityThreshold,
        enable_reranking: config.enableReranking,
      });

      const endTime = performance.now();
      setQueryTime(endTime - startTime);

      // Transform API response to RAGResult format
      const transformedResults = response.hits.map((hit: any, index: any) => ({
        chunk_id: hit.id?.toString() || `chunk-${index}`,
        document_id: hit.file_path || hit.image_id || "unknown",
        text: hit.chunk_text || hit.file_content || "",
        similarity_score: hit.score,
        rank: index + 1,
        metadata: {
          chunk_length: hit.chunk_text?.length || 0,
          document_source: hit.file_path || hit.image_path || "Unknown source",
          embedding_model: "generated",
          ...hit.metadata,
        },
      }));

      setResults(transformedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setQueryTime(null);
    setError(null);
  };

  const retrySearch = async () => {
    const currentQuery = query();
    if (currentQuery) {
      await performSearch(currentQuery);
    }
  };

  return {
    // State
    query,
    results,
    isSearching,
    queryTime,
    error,

    // Actions
    performSearch,
    clearSearch,
    retrySearch,
  };
}
