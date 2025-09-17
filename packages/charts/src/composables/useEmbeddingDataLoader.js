/**
 * Embedding Data Loader Composable
 *
 * Handles loading and processing of embedding data.
 */
import { createSignal } from "solid-js";
import { useEmbeddingVisualization } from "./useEmbeddingVisualization";
export function useEmbeddingDataLoader() {
    const embeddingViz = useEmbeddingVisualization();
    // State
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [embeddingData, setEmbeddingData] = createSignal(null);
    const [pcaData, setPcaData] = createSignal(null);
    const [qualityData, setQualityData] = createSignal(null);
    // Load embedding data and compute statistics
    const loadEmbeddingData = async () => {
        try {
            setIsLoading(true);
            setError("");
            // Get embedding statistics
            const stats = embeddingViz.stats();
            if (!stats) {
                throw new Error("Failed to load embedding statistics");
            }
            // Generate sample embeddings for demonstration
            const sampleEmbeddings = embeddingViz.generateSampleEmbeddings(1000, stats.embedding_dimension);
            // Process distribution data
            const distributionData = embeddingViz.processDistributionData(sampleEmbeddings);
            setEmbeddingData(distributionData);
            // Process PCA data
            const pcaVarianceData = embeddingViz.processPCAVarianceData(sampleEmbeddings);
            setPcaData(pcaVarianceData);
            // Process quality data
            const qualityMetricsData = embeddingViz.processQualityMetricsData(sampleEmbeddings);
            setQualityData(qualityMetricsData);
        }
        catch (err) {
            console.error("Error loading embedding data:", err);
            setError(err instanceof Error ? err.message : "Failed to load embedding data");
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        // State
        embeddingData,
        pcaData,
        qualityData,
        isLoading,
        error,
        // Actions
        loadEmbeddingData,
    };
}
