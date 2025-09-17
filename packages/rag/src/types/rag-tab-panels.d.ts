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
    rag: any;
    documents: () => RAGDocument[];
    stats: () => RAGStats | null;
    error: () => string | null;
    query: () => string;
    setQuery: (query: string) => void;
    results: () => RAGResult[];
    isSearching: () => boolean;
    queryTime: () => number | null;
    embeddingModel: () => string;
    setEmbeddingModel: (model: string) => void;
    maxResults: () => number;
    setMaxResults: (maxResults: number) => void;
    similarityThreshold: () => number;
    setSimilarityThreshold: (threshold: number) => void;
    enableReranking: () => boolean;
    setEnableReranking: (enabled: boolean) => void;
    isUploading: () => boolean;
    uploadProgress: () => number;
    loadDocuments: () => Promise<void>;
    loadStats: () => Promise<void>;
    uploadFile: (file: File, basePath: string, onUpload?: (result: any) => void) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
    search: (query: string) => Promise<void>;
    legacyResults: () => RAGResult[];
    queryResponse: () => RAGQueryResponse | null;
}
/**
 * RAG Handlers interface representing the handlers returned by useRAGSearchHandlers
 */
export interface RAGHandlers {
    handleSearch: () => void;
    handleKeyPress: (e: KeyboardEvent) => void;
    handleResultClick: (result: RAGResult) => void;
    handleFileSelect: (e: Event) => void;
    handleAdvancedSearch?: (query: string) => Promise<void>;
    handleOpenFileModal?: (filePath: string, fileName: string, fileContent: string) => void;
    handleOpenImageModal?: (imagePath: string, imageId: string, score: number) => void;
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
