/**
 * RAG Search State Composable
 *
 * Manages state and operations for the RAG search component
 * following Reynard composable conventions.
 */
import { createSignal } from "solid-js";
import { useRAG } from "./useRAG";
export function useRAGSearchState(config) {
    // Use RAG composable
    const rag = useRAG({
        authFetch: async (input, init) => {
            const url = typeof input === "string" ? input : input.toString();
            const fullUrl = url.startsWith("http")
                ? url
                : `${config.apiService.getBasePath()}${url}`;
            return fetch(fullUrl, init);
        },
        queryUrl: "/api/rag/query",
        configUrl: "/api/rag/config",
        ingestUrl: "/api/rag/ingest",
        adminUrl: "/api/rag/admin",
        metricsUrl: "/api/rag/ops/metrics",
    });
    // State management
    const [documents, setDocuments] = createSignal([]);
    const [stats, setStats] = createSignal(null);
    const [error, setError] = createSignal(null);
    // Search state
    const [query, setQuery] = createSignal("");
    const [results, setResults] = createSignal([]);
    const [isSearching, setIsSearching] = createSignal(false);
    const [queryTime, setQueryTime] = createSignal(null);
    // Search settings
    const [embeddingModel, setEmbeddingModel] = createSignal(config.defaultModel);
    const [maxResults, setMaxResults] = createSignal(config.maxResults);
    const [similarityThreshold, setSimilarityThreshold] = createSignal(config.similarityThreshold);
    const [enableReranking, setEnableReranking] = createSignal(config.enableReranking);
    // Upload state
    const [isUploading, setIsUploading] = createSignal(false);
    const [uploadProgress, setUploadProgress] = createSignal(0);
    // API operations
    const loadDocuments = async () => {
        try {
            const response = await config.apiService.loadDocuments();
            setDocuments(response);
        }
        catch (err) {
            console.error("Failed to load documents:", err);
        }
    };
    const loadStats = async () => {
        try {
            const response = await config.apiService.loadStats();
            setStats(response);
        }
        catch (err) {
            console.error("Failed to load stats:", err);
        }
    };
    const uploadFile = async (file, basePath, onUpload) => {
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);
        try {
            const result = await config.apiService.uploadFile(file, basePath);
            setUploadProgress(100);
            // Reload documents and stats
            await loadDocuments();
            await loadStats();
            onUpload?.(result);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        }
        finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };
    const deleteDocument = async (documentId) => {
        try {
            await config.apiService.deleteDocument(documentId);
            await loadDocuments();
            await loadStats();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
        }
    };
    const search = async (searchQuery) => {
        if (!searchQuery.trim())
            return;
        setIsSearching(true);
        setError(null);
        setQuery(searchQuery);
        try {
            const startTime = Date.now();
            const response = await rag.query({
                q: searchQuery,
                modality: "docs",
                topK: maxResults(),
            });
            const endTime = Date.now();
            setQueryTime(endTime - startTime);
            // Convert results to legacy format
            const legacyResults = response.hits?.map((hit, index) => convertToLegacyResult(hit, index)) ||
                [];
            setResults(legacyResults);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Search failed");
            setResults([]);
        }
        finally {
            setIsSearching(false);
        }
    };
    // Helper function to convert generated API results to legacy format
    const convertToLegacyResult = (hit, index) => ({
        chunk_id: hit.id?.toString() || `chunk-${index}`,
        document_id: hit.file_path || "unknown",
        text: hit.chunk_text || hit.file_content || "",
        similarity_score: hit.score,
        rank: index + 1,
        metadata: {
            chunk_length: hit.chunk_tokens,
            document_source: hit.file_path,
            embedding_model: "generated",
            ...hit.extra,
        },
    });
    // Computed values
    const legacyResults = () => results();
    const queryResponse = () => {
        const currentResults = results();
        const currentQueryTime = queryTime();
        if (currentResults.length > 0 && currentQueryTime) {
            return {
                query_time: currentQueryTime * 1000, // Convert to ms
                embedding_time: 0, // Not available in generated client yet
                search_time: 0, // Not available in generated client yet
                total_results: currentResults.length,
            };
        }
        return null;
    };
    return {
        // RAG composable
        rag,
        // State
        documents,
        stats,
        error,
        // Search state
        query,
        setQuery,
        results,
        isSearching,
        queryTime,
        // Settings
        embeddingModel,
        setEmbeddingModel,
        maxResults,
        setMaxResults,
        similarityThreshold,
        setSimilarityThreshold,
        enableReranking,
        setEnableReranking,
        // Upload state
        isUploading,
        uploadProgress,
        // Operations
        loadDocuments,
        loadStats,
        uploadFile,
        deleteDocument,
        search,
        // Computed values
        legacyResults,
        queryResponse,
    };
}
