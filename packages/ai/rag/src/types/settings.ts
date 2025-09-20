/**
 * Settings Types and Interfaces
 *
 * Type definitions for RAG settings configuration
 * following Reynard modular architecture patterns.
 */

import type { RAGStats } from "../types";

export interface SettingsTabProps {
  embeddingModel: string;
  onEmbeddingModelChange: (model: string) => void;
  maxResults: number;
  onMaxResultsChange: (maxResults: number) => void;
  similarityThreshold: number;
  onSimilarityThresholdChange: (threshold: number) => void;
  enableReranking: boolean;
  onEnableRerankingChange: (enabled: boolean) => void;
  stats: RAGStats | null;
}

export interface EmbeddingModelOption {
  value: string;
  label: string;
}

export interface SearchSettingsConfig {
  embeddingModel: string;
  maxResults: number;
  similarityThreshold: number;
  enableReranking: boolean;
}
