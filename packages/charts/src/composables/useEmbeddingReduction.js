/**
 * Embedding Reduction Composable
 *
 * Handles dimensionality reduction operations.
 */
import { createSignal } from "solid-js";
import { useEmbeddingVisualization } from "./useEmbeddingVisualization";
export function useEmbeddingReduction() {
    const embeddingViz = useEmbeddingVisualization();
    // State
    const [reductionMethod, setReductionMethod] = createSignal("pca");
    const [reductionParams, setReductionParams] = createSignal({});
    const [maxSamples, setMaxSamples] = createSignal(1000);
    const [reductionResult, setReductionResult] = createSignal(null);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    // Perform dimensionality reduction
    const performReduction = async () => {
        try {
            setIsLoading(true);
            setError("");
            const request = {
                method: reductionMethod(),
                parameters: reductionParams(),
                max_samples: maxSamples(),
                use_cache: true,
                random_seed: 42,
            };
            const result = await embeddingViz.performReduction(request);
            if (!result?.success) {
                throw new Error(result?.error || "Dimensionality reduction failed");
            }
            setReductionResult(result);
            console.log("Reduction completed:", result);
        }
        catch (err) {
            console.error("Error performing reduction:", err);
            setError(err instanceof Error ? err.message : "Reduction failed");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Update reduction parameters
    const updateReductionParams = (key, value) => {
        setReductionParams((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    return {
        // State
        reductionMethod,
        reductionParams,
        maxSamples,
        reductionResult,
        isLoading,
        error,
        // Actions
        setReductionMethod,
        setMaxSamples,
        updateReductionParams,
        performReduction,
    };
}
