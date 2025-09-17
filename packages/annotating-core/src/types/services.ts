/**
 * Service interfaces for Reynard annotation system
 *
 * This module defines the main service interfaces for
 * annotation management and operations.
 */

import { CaptionTask, CaptionResult } from "./tasks";
import { CaptionGenerator, ModelUsageStats, HealthStatus } from "./generators";
import { AnnotationProgress } from "./progress";
import { ModelManagerConfig } from "./config";

export interface AnnotationService {
  generateCaption(task: CaptionTask): Promise<CaptionResult>;
  generateBatchCaptions(
    tasks: CaptionTask[],
    progressCallback?: (progress: AnnotationProgress) => void
  ): Promise<CaptionResult[]>;
  getAvailableGenerators(): Promise<CaptionGenerator[]>;
  getGenerator(name: string): CaptionGenerator | undefined;
  isGeneratorAvailable(name: string): boolean;
  preloadModel(name: string): Promise<void>;
  unloadModel(name: string): Promise<void>;
  getModelUsageStats(name: string): ModelUsageStats | null;
  getHealthStatus(): HealthStatus;
}

export interface AnnotationManager {
  start(): Promise<void>;
  stop(): Promise<void>;
  getService(): AnnotationService;
  getAvailableGenerators(): Promise<CaptionGenerator[]>;
  isGeneratorAvailable(name: string): boolean;
  preloadModel(name: string): Promise<void>;
  unloadModel(name: string): Promise<void>;
  getModelUsageStats(name: string): ModelUsageStats | null;
  getHealthStatus(): HealthStatus;
  getConfiguration(): ModelManagerConfig;
  updateConfiguration(config: Partial<ModelManagerConfig>): void;
}
