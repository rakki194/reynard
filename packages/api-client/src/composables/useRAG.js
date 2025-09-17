/**
 * RAG (Retrieval-Augmented Generation) composable for Reynard API
 */
import { createSignal } from "solid-js";
export function useRAG(options = {}) {
    const [isLoading, setIsLoading] = createSignal(false);
    const query = async (request) => {
        setIsLoading(true);
        try {
            // Stub implementation
            console.log("RAG query:", request);
            return {
                hits: [
                    { chunkText: "Sample document content", score: 0.95, extra: {} },
                ],
                total: 1,
            };
        }
        finally {
            setIsLoading(false);
        }
    };
    const getDocuments = async () => {
        // Stub implementation
        return [
            {
                id: "1",
                title: "Sample Document",
                content: "This is sample content",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ];
    };
    const getStats = async () => {
        // Stub implementation
        return {
            totalDocuments: 1,
            totalChunks: 5,
            chunksWithEmbeddings: 5,
            embeddingCoverage: 100.0,
            defaultModel: "test-model",
            vectorDbEnabled: true,
            cacheSize: 1024,
        };
    };
    return {
        isLoading,
        query,
        getDocuments,
        getStats,
    };
}
