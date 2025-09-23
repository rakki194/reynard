/**
 * Reynard RAG System
 *
 * Main entry point for the RAG (Retrieval-Augmented Generation) components
 * with EmbeddingGemma integration and comprehensive search capabilities.
 */

// Core components
export { RAGSearch } from "./RAGSearch";
export { RAGSearchContainer } from "./RAGSearchContainer";

// Tab components
export { SearchTab } from "./SearchTab";
export { DocumentsTab } from "./DocumentsTab";
export { UploadTab } from "./UploadTab";
export { SettingsTab } from "./SettingsTab";

// Advanced components
export { RAG3DVisualizationModal } from "./components/RAG3DVisualizationModal";
export { RAGFileModal } from "./components/RAGFileModal";
export { RAGImageModal } from "./components/RAGImageModal";
export { RAGSearchHistory } from "./components/RAGSearchHistory";

// API service
export { RAGApiService } from "./api-service";

// Composables
export { useRAGSearchState } from "./useRAGSearchState";
export { useRAGSearchHandlers } from "./useRAGSearchHandlers";

// New modular composables
export { useRAGDocuments } from "./composables/useRAGDocuments";
export { useRAGSearch } from "./composables/useRAGSearch";
export { useRAGSettings } from "./composables/useRAGSettings";
export { useRAGHistory } from "./composables/useRAGHistory";

// Types and interfaces
export type {
  RAGResult,
  RAGDocument,
  RAGStats,
  RAGSearchProps,
  RAGQueryResponse,
  TabItem,
  // Advanced types
  FileModalState,
  ImageModalState,
  ThreeDModalState,
  EmbeddingPoint,
  SearchHistoryItem,
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
