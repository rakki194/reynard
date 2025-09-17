/**
 * RAG Tab Panels Types and Interfaces
 *
 * Type definitions for RAG tab panels component
 * following Reynard modular architecture patterns.
 */

import type { RAGResult, RAGDocument, RAGStats, RAGQueryResponse, RAGQueryHit, RAGModality } from "../types";

/**
 * RAG State interface representing the state returned by useRAGSearchState
 */
export interface RAGState {
  // RAG composable
  rag: any; // This comes from useRAG composable

  // State signals
  documents: () => RAGDocument[];
  stats: () => RAGStats | null;
  error: () => string | null;

  // Search state signals
  query: () => string;
  setQuery: (query: string) => void;
  results: () => RAGResult[];
  isSearching: () => boolean;
  queryTime: () => number | null;

  // Settings signals
  embeddingModel: () => string;
  setEmbeddingModel: (model: string) => void;
  maxResults: () => number;
  setMaxResults: (maxResults: number) => void;
  similarityThreshold: () => number;
  setSimilarityThreshold: (threshold: number) => void;
  enableReranking: () => boolean;
  setEnableReranking: (enabled: boolean) => void;

  // Upload state signals
  isUploading: () => boolean;
  uploadProgress: () => number;

  // Operations
  loadDocuments: () => Promise<void>;
  loadStats: () => Promise<void>;
  uploadFile: (file: File, basePath: string, onUpload?: (result: any) => void) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  search: (query: string) => Promise<void>;

  // Computed values
  legacyResults: () => RAGResult[];
  queryResponse: () => RAGQueryResponse | null;
}

/**
 * RAG Handlers interface representing the handlers returned by useRAGSearchHandlers
 */
export interface RAGHandlers {
  // Basic handlers
  handleSearch: () => void;
  handleKeyPress: (e: KeyboardEvent) => void;
  handleResultClick: (result: RAGResult) => void;
  handleFileSelect: (e: Event) => void;

  // Advanced handlers (from RAGSearch component)
  handleAdvancedSearch?: (query: string) => Promise<void>;
  handleOpenFileModal?: (filePath: string, fileName: string, fileContent: string) => void;
  handleOpenImageModal?: (imagePath: string, imageId: string, score: number) => void;

  // Advanced state (from RAGSearch component)
  enhancedResults?: RAGQueryHit[];
  modality?: RAGModality;
}

/**
 * Props interface for RAGTabPanels component
 */
export interface RAGTabPanelsProps {
  activeTab: string;
  ragState: RAGState;
  handlers: RAGHandlers;
}
