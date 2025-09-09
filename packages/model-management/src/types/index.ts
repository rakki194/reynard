/**
 * Model Management Types
 *
 * Core types for the model management system including model lifecycle,
 * download management, and model registry.
 */

export enum ModelType {
  CAPTION_GENERATOR = "caption_generator",
  DETECTION_MODEL = "detection_model",
  EMBEDDING_MODEL = "embedding_model",
  DIFFUSION_LM = "diffusion_lm",
  CLASSIFICATION_MODEL = "classification_model",
}

export enum ModelStatus {
  NOT_DOWNLOADED = "not_downloaded",
  DOWNLOADING = "downloading",
  DOWNLOADED = "downloaded",
  LOADING = "loading",
  LOADED = "loaded",
  ERROR = "error",
}

export enum ModelHealth {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
  UNKNOWN = "unknown",
}

export interface ModelInfo {
  modelId: string;
  modelType: ModelType;
  repoId: string;
  description: string;
  totalSizeEstimate: number;
  fileCountEstimate: number;
  version?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ModelDownloadProgress {
  modelId: string;
  status: ModelStatus;
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes: number;
  currentFile?: string;
  error?: string;
  startTime?: Date;
  estimatedTimeRemaining?: number;
}

export interface ModelConfig {
  modelId: string;
  modelType: ModelType;
  config: Record<string, any>;
  enabled: boolean;
  autoDownload: boolean;
  autoLoad: boolean;
  priority: number;
}

export interface ModelInstance {
  modelId: string;
  modelType: ModelType;
  status: ModelStatus;
  health: ModelHealth;
  config: Record<string, any>;
  loadedAt?: Date;
  lastUsed?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ModelManagerConfig {
  downloadDirectory: string;
  maxConcurrentDownloads: number;
  maxConcurrentLoads: number;
  downloadTimeout: number;
  loadTimeout: number;
  enableAutoDownload: boolean;
  enableAutoLoad: boolean;
  cacheSize: number;
  cleanupInterval: number;
}

export interface ModelRegistry {
  registerModel(modelInfo: ModelInfo): void;
  unregisterModel(modelId: string): void;
  getModelInfo(modelId: string): ModelInfo | undefined;
  getAllModelInfo(): ModelInfo[];
  isModelRegistered(modelId: string): boolean;
  getModelsByType(modelType: ModelType): ModelInfo[];
}

export interface ModelDownloadManager {
  downloadModel(
    modelId: string,
    progressCallback?: (progress: ModelDownloadProgress) => void,
  ): Promise<void>;
  cancelDownload(modelId: string): void;
  getDownloadProgress(modelId: string): ModelDownloadProgress | undefined;
  getAllDownloadProgress(): Record<string, ModelDownloadProgress>;
  isDownloading(modelId: string): boolean;
  isDownloaded(modelId: string): boolean;
}

export interface ModelLoader {
  loadModel(
    modelId: string,
    config?: Record<string, any>,
  ): Promise<ModelInstance>;
  unloadModel(modelId: string): Promise<void>;
  getLoadedModel(modelId: string): ModelInstance | undefined;
  getAllLoadedModels(): Record<string, ModelInstance>;
  isModelLoaded(modelId: string): boolean;
  getModelHealth(modelId: string): ModelHealth;
}

export interface ModelManager {
  registerModel(modelInfo: ModelInfo): void;
  downloadModel(
    modelId: string,
    progressCallback?: (progress: ModelDownloadProgress) => void,
  ): Promise<void>;
  loadModel(
    modelId: string,
    config?: Record<string, any>,
  ): Promise<ModelInstance>;
  unloadModel(modelId: string): Promise<void>;
  getModelInfo(modelId: string): ModelInfo | undefined;
  getModelInstance(modelId: string): ModelInstance | undefined;
  getAllModels(): Record<string, ModelInfo>;
  getAllInstances(): Record<string, ModelInstance>;
  isModelAvailable(modelId: string): boolean;
  isModelLoaded(modelId: string): boolean;
  getModelStatus(modelId: string): ModelStatus;
  getModelHealth(modelId: string): ModelHealth;
  updateModelConfig(modelId: string, config: Record<string, any>): void;
  deleteModel(modelId: string): Promise<void>;
}

export interface ModelEvent {
  type:
    | "download_start"
    | "download_progress"
    | "download_complete"
    | "download_error"
    | "load_start"
    | "load_complete"
    | "load_error"
    | "unload"
    | "health_change"
    | "config_update";
  modelId: string;
  timestamp: Date;
  data?: any;
}

export type ModelEventHandler = (event: ModelEvent) => void;

export interface ModelManagerState {
  models: Record<string, ModelInfo>;
  instances: Record<string, ModelInstance>;
  downloadProgress: Record<string, ModelDownloadProgress>;
  isDownloading: boolean;
  isLoading: boolean;
  lastUpdate: Date;
}

// Model-specific interfaces
export interface CaptionGeneratorConfig {
  threshold?: number;
  forceCpu?: boolean;
  batchSize?: number;
  maxLength?: number;
  postProcess?: boolean;
}

export interface DetectionModelConfig {
  confidence?: number;
  nmsThreshold?: number;
  maxDetections?: number;
  inputSize?: [number, number];
}

export interface EmbeddingModelConfig {
  dimension?: number;
  normalize?: boolean;
  batchSize?: number;
  maxSequenceLength?: number;
}

export interface ModelCapabilities {
  batchProcessing: boolean;
  gpuAcceleration: boolean;
  streaming: boolean;
  realTime: boolean;
  multilingual: boolean;
  customWeights: boolean;
}
