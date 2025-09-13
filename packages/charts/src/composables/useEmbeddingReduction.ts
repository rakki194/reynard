/**
 * Embedding Reduction Composable
 *
 * Handles dimensionality reduction operations.
 */

import { createSignal } from "solid-js";
import { useEmbeddingVisualization } from "./useEmbeddingVisualization";
import { EmbeddingReductionRequest } from "./useEmbeddingVisualization";

export interface EmbeddingReductionState {
  reductionMethod: () => "pca" | "tsne" | "umap";
  reductionParams: () => Record<string, unknown>;
  maxSamples: () => number;
  reductionResult: () => unknown;
  isLoading: () => boolean;
  error: () => string;
}

export interface EmbeddingReductionActions {
  setReductionMethod: (method: "pca" | "tsne" | "umap") => void;
  setMaxSamples: (samples: number) => void;
  updateReductionParams: (key: string, value: unknown) => void;
  performReduction: () => Promise<void>;
}

export function useEmbeddingReduction(): EmbeddingReductionState &
  EmbeddingReductionActions {
  const embeddingViz = useEmbeddingVisualization();

  // State
  const [reductionMethod, setReductionMethod] = createSignal<
    "pca" | "tsne" | "umap"
  >("pca");
  const [reductionParams, setReductionParams] = createSignal<
    Record<string, unknown>
  >({});
  const [maxSamples, setMaxSamples] = createSignal(1000);
  const [reductionResult, setReductionResult] = createSignal<unknown>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string>("");

  // Perform dimensionality reduction
  const performReduction = async () => {
    try {
      setIsLoading(true);
      setError("");

      const request: EmbeddingReductionRequest = {
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
    } catch (err) {
      console.error("Error performing reduction:", err);
      setError(err instanceof Error ? err.message : "Reduction failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Update reduction parameters
  const updateReductionParams = (key: string, value: unknown) => {
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
