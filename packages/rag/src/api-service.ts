/**
 * RAG API Service
 * 
 * Handles all backend communication for RAG operations
 * using Reynard API client conventions.
 */

import type { RAGDocument, RAGStats } from "./types";

export interface RAGApiServiceConfig {
  basePath: string;
}

export class RAGApiService {
  private basePath: string;

  constructor(config: RAGApiServiceConfig) {
    this.basePath = config.basePath;
  }

  /**
   * Legacy API call method for backward compatibility
   * Will be replaced with generated client methods
   */
  async apiCall(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.basePath}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error("API call failed:", err);
      throw err;
    }
  }

  /**
   * Load all documents from the RAG system
   */
  async loadDocuments(): Promise<RAGDocument[]> {
    try {
      const response = await this.apiCall("/api/rag/documents");
      return response;
    } catch (err) {
      console.error("Failed to load documents:", err);
      throw err;
    }
  }

  /**
   * Load system statistics
   */
  async loadStats(): Promise<RAGStats> {
    try {
      const response = await this.apiCall("/api/rag/stats");
      return response;
    } catch (err) {
      console.error("Failed to load stats:", err);
      throw err;
    }
  }

  /**
   * Upload a file to the RAG system
   */
  async uploadFile(file: File, basePath: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("generate_embeddings", "true");

    const response = await fetch(`${basePath}/api/rag/ingest/file`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete a document from the RAG system
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.apiCall(`/api/rag/documents/${documentId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete document:", err);
      throw err;
    }
  }

  /**
   * Get the base path for API calls
   */
  getBasePath() {
    return this.basePath;
  }
}
