/**
 * 3D Visualization Data Composable
 *
 * Manages embedding data transformation, dimensionality reduction,
 * and point cloud generation for 3D visualization.
 */
import { createSignal, createMemo } from "solid-js";
export function use3DVisualizationData(searchResults, queryEmbedding, reductionMethod, pointSize) {
    // Core visualization state
    const [transformedData, setTransformedData] = createSignal([]);
    const [originalIndices, setOriginalIndices] = createSignal([]);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    // Create embedding points for visualization
    const embeddingPoints = createMemo(() => {
        if (transformedData().length === 0 || searchResults().length === 0) {
            return [];
        }
        return transformedData().map((point, index) => {
            const originalIndex = originalIndices()[index];
            const result = searchResults()[originalIndex];
            // Color based on similarity score
            const score = result?.score || 0;
            const colorIntensity = Math.max(0.1, score);
            return {
                id: `point-${index}`,
                position: [point[0], point[1], point[2]],
                color: [colorIntensity, 1 - colorIntensity, 0.5],
                size: pointSize(),
                metadata: {
                    score,
                    originalIndex,
                    result,
                },
                originalIndex,
            };
        });
    });
    // Mock dimensionality reduction function (replace with actual implementation)
    const performDimensionalityReduction = async (embeddings, method) => {
        // This is a mock implementation - replace with actual dimensionality reduction
        return embeddings.map((_, index) => [
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
        ]);
    };
    // Load embedding data and perform dimensionality reduction
    const loadEmbeddingData = async () => {
        if (searchResults().length === 0)
            return;
        setIsLoading(true);
        setError(null);
        try {
            // Extract embeddings from search results
            const embeddings = searchResults()
                .map((result) => result.embedding_vector)
                .filter((embedding) => embedding !== undefined);
            if (embeddings.length === 0) {
                throw new Error("No embedding vectors found in search results");
            }
            // Add query embedding if available
            if (queryEmbedding()) {
                embeddings.unshift(queryEmbedding());
            }
            // Perform dimensionality reduction
            const method = reductionMethod();
            const reducedData = await performDimensionalityReduction(embeddings, method);
            setTransformedData(reducedData);
            setOriginalIndices(Array.from({ length: reducedData.length }, (_, i) => i));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load embedding data");
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        // State
        transformedData,
        originalIndices,
        isLoading,
        error,
        // Computed
        embeddingPoints,
        // Actions
        loadEmbeddingData,
    };
}
