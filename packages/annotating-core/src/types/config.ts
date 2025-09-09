/**
 * Configuration interfaces for Reynard annotation system
 *
 * This module defines configuration interfaces for generators,
 * post-processing, and model management.
 */

export interface CaptionGeneratorConfig {
  threshold?: number;
  batchSize?: number;
  maxRetries?: number;
  timeout?: number;
  postProcessing?: PostProcessingConfig;
  [key: string]: any;
}

export interface PostProcessingConfig {
  enabled: boolean;
  pipeline?: string[];
  rules?: Record<string, any>;
  overrides?: Record<string, Record<string, any>>;
}

export interface ModelManagerConfig {
  maxConcurrentDownloads: number;
  maxConcurrentLoads: number;
  downloadTimeout: number;
  loadTimeout: number;
  autoUnloadDelay: number; // Auto-unload models after this many seconds of inactivity
  healthCheckInterval: number;
  usageTrackingEnabled: boolean;
  preloadEnabled: boolean;
  preloadModels: string[];
}
