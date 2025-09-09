/**
 * Reynard RAG System
 *
 * Main entry point for the RAG (Retrieval-Augmented Generation) components
 * with EmbeddingGemma integration and comprehensive search capabilities.
 */

// Core components
export { RAGSearch } from "./RAGSearch";

// Tab components
export { SearchTab } from "./SearchTab";
export { DocumentsTab } from "./DocumentsTab";
export { UploadTab } from "./UploadTab";
export { SettingsTab } from "./SettingsTab";

// API service
export { RAGApiService } from "./api-service";

// Composables
export { useRAGSearchState } from "./useRAGSearchState";
export { useRAGSearchHandlers } from "./useRAGSearchHandlers";

// Types and interfaces
export type {
  RAGResult,
  RAGDocument,
  RAGStats,
  RAGSearchProps,
  RAGQueryResponse,
  TabItem,
} from "./types";

// RAG Composables
export { useRAG, createRAGClient } from "./useRAG";
export type {
  RAGModality,
  RAGQueryParams,
  RAGQueryHit,
  RAGQueryResponse as RAGQueryResponseGenerated,
  RAGIngestItem,
  RAGStreamEvent,
  RAGConfig,
  RAGIndexingStatus,
  RAGMetrics,
  RAGClientOptions,
} from "./rag-types";

// RAG Utilities
export { createRAGConfigClient } from "./rag-config";

// Styles
import "./styles.css";
