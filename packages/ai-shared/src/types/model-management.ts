/**
 * Model Management Types
 *
 * Defines types for managing AI/ML models, their configurations, and lifecycle
 * operations within the Reynard framework.
 */

import type { PostProcessingRules } from "./caption-generation";

export enum ModelStatus {
  NOT_LOADED = "not_loaded",
  LOADING = "loading",
  LOADED = "loaded",
  UNLOADING = "unloading",
  ERROR = "error",
}

export enum ModelType {
  CAPTION = "caption",
  EMBEDDING = "embedding",
  DIFFUSION = "diffusion",
  TTS = "tts",
  LLM = "llm",
  VISION = "vision",
}

export interface ModelInfo {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  description: string;
  status: ModelStatus;
  size: number;
  memoryUsage: number;
  gpuAcceleration: boolean;
  supportedFormats: string[];
  configSchema: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelConfig {
  threshold?: number;
  maxLength?: number;
  temperature?: number;
  batchSize?: number;
  gpuAcceleration?: boolean;
  postProcessing?: PostProcessingRules;
  [key: string]: any;
}
