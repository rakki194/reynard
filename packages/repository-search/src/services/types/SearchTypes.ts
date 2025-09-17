/**
 * Search Types
 *
 * Type definitions for search functionality including vector search,
 * hybrid search, and multimodal search operations.
 */

import type { ModalityType, SearchOptions, SearchResult, VectorEmbedding } from "../../types";

export interface VectorSearchOptions {
  topK: number;
  similarityThreshold: number;
  modality?: ModalityType;
  includeMetadata: boolean;
  rerank: boolean;
}

export interface HybridSearchOptions extends VectorSearchOptions {
  keywordWeight: number;
  vectorWeight: number;
  enableReranking: boolean;
}

export interface SearchFilters {
  fileTypes?: string[];
  dateRange?: { from: Date; to: Date };
  sizeRange?: { min: number; max: number };
  tags?: string[];
  datasetIds?: string[];
  modalities?: ModalityType[];
}

export interface SearchMetrics {
  totalResults: number;
  searchTime: number;
  vectorSearchTime: number;
  keywordSearchTime: number;
  rerankTime?: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface SearchCacheEntry {
  results: SearchResult[];
  timestamp: number;
  ttl: number;
}

export interface SearchConfig {
  maxResults: number;
  defaultTopK: number;
  defaultSimilarityThreshold: number;
  enableCaching: boolean;
  cacheSize: number;
  enableReranking: boolean;
  hybridSearchEnabled: boolean;
  vectorWeight: number;
  keywordWeight: number;
}
