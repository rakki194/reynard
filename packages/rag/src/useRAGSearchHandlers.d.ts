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
    uploadFile: (file: File, basePath: string, onUpload?: (result: any) => void) => Promise<void>;
    search: () => void;
}
export declare function useRAGSearchHandlers(config: RAGSearchHandlersConfig): {
    handleSearch: () => void;
    handleKeyPress: (e: KeyboardEvent) => void;
    handleResultClick: (result: RAGResult) => void;
    handleFileSelect: (e: Event) => void;
};
