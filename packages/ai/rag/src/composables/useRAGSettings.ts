/**
 * RAG Settings Composable
 *
 * Focused state management for search configuration.
 * Extracted from useRAGSearchState.ts to follow the 140-line axiom.
 */
import { createSignal } from "solid-js";

export interface RAGSettingsConfig {
  defaultModel: string;
  maxResults: number;
  similarityThreshold: number;
  enableReranking: boolean;
}

export function useRAGSettings(config: RAGSettingsConfig) {
  // Settings state
  const [embeddingModel, setEmbeddingModel] = createSignal(config.defaultModel);
  const [maxResults, setMaxResults] = createSignal(config.maxResults);
  const [similarityThreshold, setSimilarityThreshold] = createSignal(config.similarityThreshold);
  const [enableReranking, setEnableReranking] = createSignal(config.enableReranking);

  // Settings operations
  const updateEmbeddingModel = (model: string) => {
    setEmbeddingModel(model);
  };

  const updateMaxResults = (results: number) => {
    setMaxResults(Math.max(1, Math.min(1000, results))); // Clamp between 1-1000
  };

  const updateSimilarityThreshold = (threshold: number) => {
    setSimilarityThreshold(Math.max(0, Math.min(1, threshold))); // Clamp between 0-1
  };

  const updateEnableReranking = (enabled: boolean) => {
    setEnableReranking(enabled);
  };

  const resetToDefaults = () => {
    setEmbeddingModel(config.defaultModel);
    setMaxResults(config.maxResults);
    setSimilarityThreshold(config.similarityThreshold);
    setEnableReranking(config.enableReranking);
  };

  const getCurrentSettings = () => ({
    embeddingModel: embeddingModel(),
    maxResults: maxResults(),
    similarityThreshold: similarityThreshold(),
    enableReranking: enableReranking(),
  });

  return {
    // State
    embeddingModel,
    maxResults,
    similarityThreshold,
    enableReranking,

    // Actions
    updateEmbeddingModel,
    updateMaxResults,
    updateSimilarityThreshold,
    updateEnableReranking,
    resetToDefaults,
    getCurrentSettings,
  };
}
