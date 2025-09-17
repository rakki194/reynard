/**
 * RAG Types and Interfaces
 *
 * Type definitions for RAG (Retrieval-Augmented Generation) system
 * with EmbeddingGemma integration using Reynard conventions.
 */
export interface RAGResult {
    chunk_id: string;
    document_id: string;
    text: string;
    similarity_score: number;
    rank: number;
    metadata: {
        chunk_length?: number;
        document_source?: string;
        embedding_model?: string;
        [key: string]: unknown;
    };
}
export interface RAGDocument {
    id: string;
    title: string;
    source: string;
    document_type: string;
    created_at: string;
    updated_at: string;
    chunk_count: number;
    metadata: Record<string, unknown>;
}
export interface RAGStats {
    total_documents: number;
    total_chunks: number;
    chunks_with_embeddings: number;
    embedding_coverage: number;
    default_model: string;
    vector_db_enabled: boolean;
    codewolf_enabled: boolean;
    cache_size: number;
}
export interface RAGSearchProps {
    apiBaseUrl?: string;
    defaultModel?: string;
    maxResults?: number;
    similarityThreshold?: number;
    enableReranking?: boolean;
    onResultClick?: (result: RAGResult) => void;
    onDocumentUpload?: (document: RAGDocument) => void;
    className?: string;
    show3DVisualization?: boolean;
    showFileModals?: boolean;
    showImageModals?: boolean;
    showSearchHistory?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    enableMultiModal?: boolean;
}
export interface RAGQueryResponse {
    query_time: number;
    embedding_time: number;
    search_time: number;
    total_results: number;
}
export interface TabItem {
    id: string;
    label: string;
    icon: HTMLElement | null;
}
export type RAGModality = "docs" | "images" | "code" | "captions";
export interface RAGQueryHit {
    id?: number | string;
    score: number;
    embedding_vector?: number[];
    image_path?: string;
    image_id?: string;
    file_path?: string;
    file_content?: string;
    chunk_text?: string;
    chunk_index?: number;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface FileModalState {
    isOpen: boolean;
    filePath: string;
    fileName: string;
    fileContent: string;
    chunkIndex?: number;
    chunkText?: string;
}
export interface ImageModalState {
    isOpen: boolean;
    imagePath: string;
    imageId: string;
    thumbnailPath?: string;
    previewPath?: string;
    imageMetadata?: Record<string, unknown>;
    imageDimensions?: {
        width: number;
        height: number;
    };
    imageSize?: number;
    imageFormat?: string;
    embeddingVector?: number[];
    score: number;
}
export interface ThreeDModalState {
    isOpen: boolean;
    searchQuery: string;
    searchResults: RAGQueryHit[];
    queryEmbedding?: number[];
}
export interface EmbeddingPoint {
    id: string;
    position: [number, number, number];
    color: [number, number, number];
    size: number;
    metadata: Record<string, unknown>;
    originalIndex: number;
}
export interface SearchHistoryItem {
    id: string;
    query: string;
    modality: RAGModality;
    timestamp: Date;
    resultCount: number;
    topScore: number;
}
