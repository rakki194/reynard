/**
 * RAG Search Event Handlers Composable
 *
 * Manages event handlers for the RAG search component
 * following Reynard composable conventions.
 */

import type { RAGResult } from "./types";

export interface RAGSearchHandlersConfig {
  onResultClick?: (result: RAGResult) => void;
  onDocumentUpload?: (document: any) => void;
  apiBaseUrl?: string;
  uploadFile: (
    file: File,
    basePath: string,
    onUpload?: (result: any) => void,
  ) => Promise<void>;
  search: () => void;
}

export function useRAGSearchHandlers(config: RAGSearchHandlersConfig) {
  const handleSearch = () => {
    config.search();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleResultClick = (result: RAGResult) => {
    config.onResultClick?.(result);
  };

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      config.uploadFile(
        file,
        config.apiBaseUrl || "http://localhost:8000",
        config.onDocumentUpload,
      );
    }
  };

  return {
    handleSearch,
    handleKeyPress,
    handleResultClick,
    handleFileSelect,
  };
}
