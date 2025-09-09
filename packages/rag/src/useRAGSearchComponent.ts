/**
 * RAG Search Component Composable
 * 
 * Manages component initialization and setup for RAG search
 * following Reynard composable conventions.
 */

import { createSignal, onMount } from "solid-js";
import { RAGApiService } from "./api-service";
import { useRAGSearchState } from "./useRAGSearchState";
import { useRAGSearchHandlers } from "./useRAGSearchHandlers";
import type { RAGSearchProps } from "./types";

export interface RAGSearchComponentConfig {
  props: RAGSearchProps;
}

/**
 * Composable for managing RAG search component initialization and state
 * 
 * @param config Component configuration
 * @returns Component state and handlers
 */
export function useRAGSearchComponent(config: RAGSearchComponentConfig) {
  // Create API service
  const apiService = new RAGApiService({
    basePath: config.props.apiBaseUrl || "http://localhost:8000"
  });

  // Use RAG search state composable
  const ragState = useRAGSearchState({
    apiService,
    defaultModel: config.props.defaultModel || "embeddinggemma:latest",
    maxResults: config.props.maxResults || 10,
    similarityThreshold: config.props.similarityThreshold || 0.7,
    enableReranking: config.props.enableReranking || false
  });

  // UI state
  const [activeTab, setActiveTab] = createSignal("search");

  // Load initial data
  onMount(() => {
    ragState.loadDocuments();
    ragState.loadStats();
  });

  // Event handlers
  const handlers = useRAGSearchHandlers({
    onResultClick: config.props.onResultClick,
    onDocumentUpload: config.props.onDocumentUpload,
    apiBaseUrl: config.props.apiBaseUrl,
    uploadFile: ragState.uploadFile,
    search: () => ragState.search(ragState.query())
  });

  return {
    ragState,
    handlers,
    activeTab,
    setActiveTab
  };
}
