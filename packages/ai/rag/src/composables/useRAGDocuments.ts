/**
 * RAG Documents Composable
 *
 * Focused state management for document operations.
 * Extracted from useRAGSearchState.ts to follow the 140-line axiom.
 */
import { createSignal } from "solid-js";
import type { RAGDocument, RAGStats } from "../types";
import { RAGApiService } from "../api-service";

export interface RAGDocumentsConfig {
  apiService: RAGApiService;
}

export function useRAGDocuments(config: RAGDocumentsConfig) {
  // Document state
  const [documents, setDocuments] = createSignal<RAGDocument[]>([]);
  const [stats, setStats] = createSignal<RAGStats | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Document operations
  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await config.apiService.getDocuments();
      setDocuments(response);
      // setStats(response.stats || null); // TODO: Implement stats endpoint
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
      console.error("Document loading failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDocuments = async () => {
    await loadDocuments();
  };

  const uploadDocument = async (file: File, source?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await config.apiService.uploadDocument(file);
      // Refresh documents after upload
      await loadDocuments();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
      console.error("Document upload failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await config.apiService.deleteDocument(documentId);
      // Refresh documents after deletion
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
      console.error("Document deletion failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    documents,
    stats,
    isLoading,
    error,

    // Actions
    loadDocuments,
    refreshDocuments,
    uploadDocument,
    deleteDocument,
  };
}
