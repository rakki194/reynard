/**
 * Annotation Types
 * 
 * Core types for the annotation system including caption generation,
 * tagging, and annotation workflows.
 */

export enum CaptionType {
  CAPTION = 'caption',
  TAGS = 'tags',
  E621 = 'e621',
  TOML = 'toml'
}

export enum AnnotationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface CaptionResult {
  imagePath: string;
  generatorName: string;
  success: boolean;
  caption: string;
  processingTime: number;
  captionType: CaptionType;
  error?: string;
  metadata?: Record<string, any>;
}

export interface CaptionTask {
  imagePath: string;
  generatorName: string;
  config?: Record<string, any>;
  postProcess?: boolean;
  force?: boolean;
}

export interface AnnotationConfig {
  generatorName: string;
  postProcess: boolean;
  force: boolean;
  batchSize: number;
  maxConcurrent: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface AnnotationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  progress: number; // 0-100
  estimatedTimeRemaining?: number;
  startTime: Date;
}

export interface AnnotationBatch {
  id: string;
  tasks: CaptionTask[];
  config: AnnotationConfig;
  status: AnnotationStatus;
  progress: AnnotationProgress;
  results: CaptionResult[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface CaptionGenerator {
  name: string;
  description: string;
  version: string;
  captionType: CaptionType;
  isAvailable: boolean;
  isLoaded: boolean;
  configSchema: Record<string, any>;
  features: string[];
  metadata?: Record<string, any>;
}

export interface CaptionGeneratorConfig {
  threshold?: number;
  forceCpu?: boolean;
  batchSize?: number;
  maxLength?: number;
  postProcess?: boolean;
  customWeights?: string;
  device?: string;
  precision?: 'float16' | 'float32' | 'int8';
}

export interface PostProcessingRules {
  replaceUnderscores: boolean;
  normalizeSpacing: boolean;
  ensureTerminalPunctuation: boolean;
  removeDuplicateWords: boolean;
  capitalizeFirst: boolean;
  customRules?: Array<{
    pattern: string;
    replacement: string;
    flags?: string;
  }>;
}

export interface AnnotationService {
  generateCaption(task: CaptionTask): Promise<CaptionResult>;
  generateBatchCaptions(tasks: CaptionTask[], progressCallback?: (progress: AnnotationProgress) => void): Promise<CaptionResult[]>;
  getAvailableGenerators(): Promise<CaptionGenerator[]>;
  getGenerator(name: string): CaptionGenerator | undefined;
  isGeneratorAvailable(name: string): boolean;
  isModelLoaded(name: string): boolean;
  updateGeneratorConfig(name: string, config: Record<string, any>): void;
  getGeneratorConfig(name: string): Record<string, any> | undefined;
  preloadModel(name: string): Promise<void>;
  unloadModel(name: string): Promise<void>;
}

export interface AnnotationManager {
  registerGenerator(generator: any): void;
  unregisterGenerator(name: string): void;
  getService(): AnnotationService;
  getAvailableGenerators(): Promise<CaptionGenerator[]>;
  getGenerator(name: string): CaptionGenerator | undefined;
  isGeneratorAvailable(name: string): boolean;
  updateGeneratorConfig(name: string, config: Record<string, any>): void;
  getGeneratorConfig(name: string): Record<string, any> | undefined;
  preloadModel(name: string): Promise<void>;
  unloadModel(name: string): Promise<void>;
  getServiceStatus(): {
    isRunning: boolean;
    activeTasks: number;
    queuedTasks: number;
    totalProcessed: number;
    averageProcessingTime: number;
  };
}

export interface AnnotationEvent {
  type: 'generation_start' | 'generation_progress' | 'generation_complete' | 'generation_error' |
        'batch_start' | 'batch_progress' | 'batch_complete' | 'batch_error' |
        'model_load' | 'model_unload' | 'config_update';
  generatorName?: string;
  taskId?: string;
  batchId?: string;
  timestamp: Date;
  data?: any;
}

export type AnnotationEventHandler = (event: AnnotationEvent) => void;

export interface AnnotationManagerState {
  generators: Record<string, CaptionGenerator>;
  activeTasks: number;
  queuedTasks: number;
  totalProcessed: number;
  averageProcessingTime: number;
  isRunning: boolean;
  lastUpdate: Date;
}

// Generator-specific interfaces
export interface JTP2Config extends CaptionGeneratorConfig {
  threshold: number;
  forceCpu: boolean;
  tagsPath: string;
  modelPath: string;
}

export interface WDv3Config extends CaptionGeneratorConfig {
  threshold: number;
  forceCpu: boolean;
  modelPath: string;
  tagsPath: string;
  architecture: 'vit' | 'swinv2' | 'convnext';
}

export interface JoyCaptionConfig extends CaptionGeneratorConfig {
  maxLength: number;
  temperature: number;
  topP: number;
  repetitionPenalty: number;
  modelPath: string;
}

export interface Florence2Config extends CaptionGeneratorConfig {
  maxLength: number;
  temperature: number;
  modelPath: string;
  task: 'caption' | 'dense_caption' | 'region_caption';
}

// Utility types
export interface ImageInfo {
  path: string;
  size: number;
  width: number;
  height: number;
  format: string;
  lastModified: Date;
  metadata?: Record<string, any>;
}

export interface AnnotationResult {
  imagePath: string;
  caption: string;
  captionType: CaptionType;
  generatorName: string;
  processingTime: number;
  confidence?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface AnnotationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: AnnotationStep[];
  config: AnnotationConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationStep {
  id: string;
  name: string;
  generatorName: string;
  config: Record<string, any>;
  condition?: string;
  order: number;
}
