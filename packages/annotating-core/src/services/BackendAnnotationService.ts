/**
 * Backend Annotation Service
 *
 * This service interfaces with the FastAPI backend instead of implementing
 * local model loading and generation logic.
 */

import {
  CaptionTask,
  CaptionResult,
  CaptionGenerator,
  AnnotationProgress,
  AnnotationService as IAnnotationService,
  ModelUsageStats,
  HealthStatus,
  AnyAnnotationEvent,
} from "../types/index.js";
import { CaptionApiClient, createCaptionApiClient } from "../clients/index.js";
import { SimpleEventManager } from "./EventManager.js";
import { BatchProcessor } from "./BatchProcessor.js";
import { SingleCaptionProcessor } from "./SingleCaptionProcessor.js";
import { GeneratorManager } from "./GeneratorManager.js";
import { HealthStatsManager } from "./HealthStatsManager.js";

export interface BackendAnnotationServiceConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
}

export class BackendAnnotationService implements IAnnotationService {
  private client: CaptionApiClient;
  private eventManager: SimpleEventManager;
  private singleProcessor: SingleCaptionProcessor;
  private batchProcessor: BatchProcessor;
  private generatorManager: GeneratorManager;
  private healthStatsManager: HealthStatsManager;

  constructor(config: BackendAnnotationServiceConfig) {
    this.client = createCaptionApiClient(config);
    this.eventManager = new SimpleEventManager();
    this.singleProcessor = new SingleCaptionProcessor(this.client, this.eventManager);
    this.batchProcessor = new BatchProcessor(this.client, this.eventManager);
    this.generatorManager = new GeneratorManager(this.client);
    this.healthStatsManager = new HealthStatsManager();
    this.generatorManager.initializeGenerators();
  }

  async generateCaption(task: CaptionTask): Promise<CaptionResult> {
    return this.singleProcessor.processCaption(task);
  }

  async generateBatchCaptions(
    tasks: CaptionTask[],
    progressCallback?: (progress: AnnotationProgress) => void
  ): Promise<CaptionResult[]> {
    return this.batchProcessor.processBatch(tasks, progressCallback);
  }

  async getAvailableGenerators(): Promise<CaptionGenerator[]> {
    return this.generatorManager.getAvailableGenerators();
  }

  getGenerator(name: string): CaptionGenerator | undefined {
    return this.generatorManager.getGenerator(name);
  }

  isGeneratorAvailable(name: string): boolean {
    return this.generatorManager.isGeneratorAvailable(name);
  }

  async preloadModel(name: string): Promise<void> {
    return this.generatorManager.preloadModel(name);
  }

  async unloadModel(name: string): Promise<void> {
    return this.generatorManager.unloadModel(name);
  }

  getModelUsageStats(name: string): ModelUsageStats | null {
    return this.healthStatsManager.getModelUsageStats(name);
  }

  getHealthStatus(): HealthStatus {
    return this.healthStatsManager.getHealthStatus();
  }

  // Event system
  addEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.eventManager.addEventListener(listener);
  }

  removeEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.eventManager.removeEventListener(listener);
  }

  // Statistics getters (delegated to backend)
  getTotalProcessed(): number {
    return this.healthStatsManager.getTotalProcessed();
  }

  getTotalProcessingTime(): number {
    return this.healthStatsManager.getTotalProcessingTime();
  }

  getAverageProcessingTime(): number {
    return this.healthStatsManager.getAverageProcessingTime();
  }

  getActiveTasksCount(): number {
    return this.healthStatsManager.getActiveTasksCount();
  }
}

/**
 * Create a backend annotation service
 */
export function createBackendAnnotationService(config: BackendAnnotationServiceConfig): BackendAnnotationService {
  return new BackendAnnotationService(config);
}
