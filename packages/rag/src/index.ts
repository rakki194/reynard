/**
 * Reynard RAG System
 *
 * Main entry point for the RAG (Retrieval-Augmented Generation) components
 * with EmbeddingGemma integration and comprehensive search capabilities.
 */

// Core components
export { RAGSearch } from "./RAGSearch";

// RAG Composables
export { useRAG, createRAGClient } from "./useRAG";
export type {
  RAGModality,
  RAGQueryParams,
  RAGQueryHit,
  RAGQueryResponse,
  RAGIngestItem,
  RAGStreamEvent,
  RAGConfig,
  RAGIndexingStatus,
  RAGMetrics,
  RAGClientOptions
} from "./rag-types";

// RAG Utilities
export { createRAGConfigClient } from "./rag-config";

// Styles
import "./styles.css";