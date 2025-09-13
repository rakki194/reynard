/**
 * Embedding Dashboard Composable
 *
 * Manages state and logic for the embedding visualization dashboard.
 */

import { createSignal, createEffect } from "solid-js";
import { useEmbeddingDataLoader } from "./useEmbeddingDataLoader";
import { useEmbeddingReduction } from "./useEmbeddingReduction";

export interface EmbeddingDashboardState {
  activeTab: () => "distribution" | "pca" | "quality" | "3d";
  isLoading: () => boolean;
  error: () => string;
  embeddingData: () => unknown;
  pcaData: () => unknown;
  qualityData: () => unknown;
  reductionMethod: () => "pca" | "tsne" | "umap";
  reductionParams: () => Record<string, unknown>;
  maxSamples: () => number;
  reductionResult: () => unknown;
}

export interface EmbeddingDashboardActions {
  setActiveTab: (tab: "distribution" | "pca" | "quality" | "3d") => void;
  loadEmbeddingData: () => Promise<void>;
  performReduction: () => Promise<void>;
  updateReductionParams: (key: string, value: unknown) => void;
  setReductionMethod: (method: "pca" | "tsne" | "umap") => void;
  setMaxSamples: (samples: number) => void;
}

export function useEmbeddingDashboard(
  isVisible?: () => boolean,
): EmbeddingDashboardState & EmbeddingDashboardActions {
  const dataLoader = useEmbeddingDataLoader();
  const reduction = useEmbeddingReduction();

  // State
  const [activeTab, setActiveTab] = createSignal<
    "distribution" | "pca" | "quality" | "3d"
  >("distribution");

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
