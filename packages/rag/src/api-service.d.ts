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
export declare class RAGApiService {
    private basePath;
    constructor(config: RAGApiServiceConfig);
    /**
     * Legacy API call method for backward compatibility
     * Will be replaced with generated client methods
     */
    apiCall(endpoint: string, options?: RequestInit): Promise<any>;
    /**
     * Load all documents from the RAG system
     */
    loadDocuments(): Promise<RAGDocument[]>;
    /**
     * Load system statistics
     */
    loadStats(): Promise<RAGStats>;
    /**
     * Upload a file to the RAG system
     */
    uploadFile(file: File, basePath: string): Promise<any>;
    /**
     * Delete a document from the RAG system
     */
    deleteDocument(documentId: string): Promise<void>;
    /**
     * Get the base path for API calls
     */
    getBasePath(): string;
}
