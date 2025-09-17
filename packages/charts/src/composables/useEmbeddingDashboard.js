/**
 * Embedding Dashboard Composable
 *
 * Manages state and logic for the embedding visualization dashboard.
 */
import { createSignal, createEffect } from "solid-js";
import { useEmbeddingDataLoader } from "./useEmbeddingDataLoader";
import { useEmbeddingReduction } from "./useEmbeddingReduction";
export function useEmbeddingDashboard(isVisible) {
    const dataLoader = useEmbeddingDataLoader();
    const reduction = useEmbeddingReduction();
    // State
    const [activeTab, setActiveTab] = createSignal("distribution");
    // Load embedding data when component mounts
    createEffect(() => {
        if (isVisible?.() !== false) {
            dataLoader.loadEmbeddingData();
        }
    });
    return {
        // State
        activeTab,
        isLoading: dataLoader.isLoading,
        error: dataLoader.error,
        embeddingData: dataLoader.embeddingData,
        pcaData: dataLoader.pcaData,
        qualityData: dataLoader.qualityData,
        reductionMethod: reduction.reductionMethod,
        reductionParams: reduction.reductionParams,
        maxSamples: reduction.maxSamples,
        reductionResult: reduction.reductionResult,
        // Actions
        setActiveTab,
        loadEmbeddingData: dataLoader.loadEmbeddingData,
        performReduction: reduction.performReduction,
        updateReductionParams: reduction.updateReductionParams,
        setReductionMethod: reduction.setReductionMethod,
        setMaxSamples: reduction.setMaxSamples,
    };
}
