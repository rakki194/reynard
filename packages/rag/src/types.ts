/**
 * RAG Types and Interfaces
 * 
 * Type definitions for RAG (Retrieval-Augmented Generation) system
 * with EmbeddingGemma integration using Reynard conventions.
 */

// Legacy types for backward compatibility - will be removed after migration
export interface RAGResult {
  chunk_id: string;
  document_id: string;
  text: string;
  similarity_score: number;
  rank: number;
  metadata: {
    chunk_length?: number;
    document_source?: string;
    embedding_model?: string;
    [key: string]: any;
  };
}

export interface RAGDocument {
  id: string;
  title: string;
  source: string;
  document_type: string;
  created_at: string;
  updated_at: string;
  chunk_count: number;
  metadata: Record<string, any>;
}

export interface RAGStats {
  total_documents: number;
  total_chunks: number;
  chunks_with_embeddings: number;
  embedding_coverage: number;
  default_model: string;
  vector_db_enabled: boolean;
  codewolf_enabled: boolean;
  cache_size: number;
}

export interface RAGSearchProps {
  apiBaseUrl?: string;
  defaultModel?: string;
  maxResults?: number;
  similarityThreshold?: number;
  enableReranking?: boolean;
  onResultClick?: (result: RAGResult) => void;
  onDocumentUpload?: (document: RAGDocument) => void;
  className?: string;
}

export interface RAGQueryResponse {
  query_time: number;
  embedding_time: number;
  search_time: number;
  total_results: number;
}

export interface TabItem {
  id: string;
  label: string;
  icon: any; // JSX.Element | null;
}
