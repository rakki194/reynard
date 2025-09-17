/**
 * Embedding Visualization Composable
 *
 * Provides reactive state management and API integration for embedding visualization.
 * Ported from Yipyap's useEmbeddingReduction with Reynard integration.
 */
import { useApiClient } from "reynard-core";
import { createResource, createSignal } from "solid-js";
// Simple HTTP client wrapper for API calls
const createHttpClient = (baseUrl) => ({
    async get(url) {
        const response = await fetch(`${baseUrl}${url}`);
        if (!response.ok)
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return { data: await response.json() };
    },
    async post(url, data) {
        const response = await fetch(`${baseUrl}${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok)
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return { data: await response.json() };
    },
    async delete(url) {
        const response = await fetch(`${baseUrl}${url}`, { method: "DELETE" });
        if (!response.ok)
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return { data: await response.json() };
    },
});
export function useEmbeddingVisualization() {
    const apiClient = useApiClient();
    const httpClient = createHttpClient("http://localhost:8000");
    const [currentRequest, setCurrentRequest] = createSignal(null);
    const [currentJobId, setCurrentJobId] = createSignal(null);
    // Fetch embedding statistics
    const [stats] = createResource(async () => {
        try {
            const response = await httpClient.get("/api/embedding-visualization/stats");
            return response.data;
        }
        catch (error) {
            console.error("Failed to fetch embedding stats:", error);
            throw new Error("Failed to load embedding statistics");
        }
    });
    // Fetch available methods
    const [availableMethods] = createResource(async () => {
        try {
            const response = await httpClient.get("/api/embedding-visualization/methods");
            return response.data;
        }
        catch (error) {
            console.error("Failed to fetch available methods:", error);
            throw new Error("Failed to load available methods");
        }
    });
    // Fetch cache statistics
    const [cacheStats, { refetch: refetchCacheStats }] = createResource(async () => {
        try {
            const response = await httpClient.get("/api/embedding-visualization/cache/stats");
            return response.data;
        }
        catch (error) {
            console.error("Failed to fetch cache stats:", error);
            throw new Error("Failed to load cache statistics");
        }
    });
    // Perform embedding reduction
    const [reductionResult, { refetch: refetchReduction }] = createResource(currentRequest, async (request) => {
        console.log("=== FRONTEND EMBEDDING REDUCTION REQUEST ===");
        console.log("Request:", request);
        try {
            const response = await httpClient.post("/api/embedding-visualization/reduce", request);
            const result = response.data;
            console.log("=== FRONTEND EMBEDDING REDUCTION RESPONSE ===");
            console.log("Result:", result);
            // Track job ID for progress monitoring
            if (result.job_id) {
                setCurrentJobId(result.job_id);
            }
            return result;
        }
        catch (error) {
            console.error("Embedding reduction failed:", error);
            throw new Error(error.response?.data?.detail || "Embedding reduction failed");
        }
    });
    // Analyze embedding quality
    const analyzeQuality = async (embeddings) => {
        try {
            const response = await httpClient.post("/api/embedding-visualization/quality", {
                embeddings,
            });
            return response.data;
        }
        catch (error) {
            console.error("Failed to analyze embedding quality:", error);
            throw new Error(error.response?.data?.detail || "Failed to analyze embedding quality");
        }
    };
    // Clear cache
    const clearCache = async () => {
        try {
            const response = await httpClient.delete("/api/embedding-visualization/cache");
            await refetchCacheStats();
            return response.data;
        }
        catch (error) {
            console.error("Failed to clear cache:", error);
            throw new Error("Failed to clear cache");
        }
    };
    // Perform reduction with progress tracking
    const performReduction = async (request) => {
        setCurrentRequest(request);
        return reductionResult();
    };
    // Get health status
    const getHealthStatus = async () => {
        try {
            const response = await httpClient.get("/api/embedding-visualization/health");
            return response.data;
        }
        catch (error) {
            console.error("Failed to get health status:", error);
            return {
                status: "unhealthy",
                error: error.response?.data?.detail || "Service unavailable",
            };
        }
    };
    // WebSocket connection for progress updates
    const connectProgressWebSocket = (onProgress) => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/api/embedding-visualization/progress`;
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            console.log("Connected to embedding visualization progress WebSocket");
        };
        ws.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "progress") {
                    onProgress(data);
                }
            }
            catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };
        ws.onclose = () => {
            console.log("Disconnected from embedding visualization progress WebSocket");
        };
        ws.onerror = error => {
            console.error("WebSocket error:", error);
        };
        return ws;
    };
    // Utility functions for data processing
    const generateSampleEmbeddings = (count, dimensions = 768) => {
        const embeddings = [];
        for (let i = 0; i < count; i++) {
            const embedding = [];
            for (let j = 0; j < dimensions; j++) {
                // Generate structured random data with some clustering
                const clusterId = Math.floor(i / 100);
                const baseValue = Math.random() * 2 - 1; // -1 to 1
                const clusterBias = Math.sin(clusterId * 0.1) * 0.5;
                embedding.push(baseValue + clusterBias);
            }
            embeddings.push(embedding);
        }
        return embeddings;
    };
    const processDistributionData = (embeddings) => {
        // Flatten all embedding values
        const allValues = embeddings.flat();
        // Calculate statistics
        const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
        const variance = allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length;
        const std = Math.sqrt(variance);
        const sorted = [...allValues].sort((a, b) => a - b);
        const statistics = {
            min: sorted[0],
            q1: sorted[Math.floor(sorted.length * 0.25)],
            median: sorted[Math.floor(sorted.length * 0.5)],
            q3: sorted[Math.floor(sorted.length * 0.75)],
            max: sorted[sorted.length - 1],
            mean,
            std,
        };
        return {
            values: allValues,
            statistics,
        };
    };
    const processPCAVarianceData = (embeddings) => {
        // Mock PCA variance data - in real implementation, this would come from the backend
        const nComponents = Math.min(20, embeddings[0].length);
        const explainedVarianceRatio = [];
        const cumulativeVariance = [];
        // Generate realistic PCA variance data
        let cumulative = 0;
        for (let i = 0; i < nComponents; i++) {
            const variance = Math.exp(-i * 0.2) * (0.3 + Math.random() * 0.1);
            explainedVarianceRatio.push(variance);
            cumulative += variance;
            cumulativeVariance.push(cumulative);
        }
        // Normalize to sum to 1
        const total = explainedVarianceRatio.reduce((sum, val) => sum + val, 0);
        for (let i = 0; i < nComponents; i++) {
            explainedVarianceRatio[i] /= total;
            cumulativeVariance[i] /= total;
        }
        // Find optimal components (95% variance)
        const optimalComponents = cumulativeVariance.findIndex(v => v >= 0.95) + 1;
        return {
            explained_variance_ratio: explainedVarianceRatio,
            cumulative_variance: cumulativeVariance,
            recommendations: {
                optimal_components: optimalComponents,
                variance_threshold: 0.95,
                reasoning: `First ${optimalComponents} components explain 95% of the variance`,
            },
        };
    };
    const processQualityMetricsData = (embeddings) => {
        // Mock quality metrics - in real implementation, this would come from the backend
        const metrics = [
            {
                name: "Coherence",
                value: 0.75 + Math.random() * 0.2,
                unit: "",
                higherIsBetter: true,
                goodThreshold: 0.8,
                warningThreshold: 0.6,
            },
            {
                name: "Separation",
                value: 0.65 + Math.random() * 0.25,
                unit: "",
                higherIsBetter: true,
                goodThreshold: 0.7,
                warningThreshold: 0.5,
            },
            {
                name: "Density",
                value: 0.7 + Math.random() * 0.2,
                unit: "",
                higherIsBetter: true,
                goodThreshold: 0.8,
                warningThreshold: 0.6,
            },
            {
                name: "Distribution",
                value: 0.8 + Math.random() * 0.15,
                unit: "",
                higherIsBetter: true,
                goodThreshold: 0.85,
                warningThreshold: 0.7,
            },
        ];
        const overallScore = (metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length) * 100;
        const assessment = {
            status: overallScore >= 80 ? "excellent" : overallScore >= 60 ? "good" : overallScore >= 40 ? "fair" : "poor",
            issues: overallScore < 60 ? ["Low overall quality score"] : [],
            recommendations: overallScore < 80 ? ["Consider improving embedding quality"] : ["Quality is good"],
        };
        return {
            overall_score: overallScore,
            metrics,
            assessment,
        };
    };
    return {
        // State
        stats,
        availableMethods,
        cacheStats,
        reductionResult,
        currentJobId,
        // Actions
        performReduction,
        analyzeQuality,
        clearCache,
        getHealthStatus,
        connectProgressWebSocket,
        refetchCacheStats,
        refetchReduction,
        // Utilities
        generateSampleEmbeddings,
        processDistributionData,
        processPCAVarianceData,
        processQualityMetricsData,
    };
}
