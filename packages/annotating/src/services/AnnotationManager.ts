/**
 * Annotation Manager
 * 
 * Main orchestrator for the annotation system, managing generators and services.
 */

import { 
  AnnotationManager as IAnnotationManager, 
  CaptionGenerator, 
  CaptionGeneratorConfig,
  AnnotationManagerState,
  AnnotationEvent,
  AnnotationEventHandler
} from '../types/index.js';
import { AnnotationService } from './AnnotationService.js';
import { BaseCaptionGenerator } from '../generators/BaseCaptionGenerator.js';

export class AnnotationManager implements IAnnotationManager {
  private _service: AnnotationService;
  private _generators: Map<string, BaseCaptionGenerator> = new Map();
  private _eventHandlers: Set<AnnotationEventHandler> = new Set();
  private _isRunning: boolean = false;

  constructor() {
    this._service = new AnnotationService();
    this._isRunning = true;
  }

  // Generator management
  registerGenerator(generator: BaseCaptionGenerator): void {
    this._generators.set(generator.name, generator);
    this._service.registerGenerator(generator);

    this._emitEvent({
      type: 'config_update',
      generatorName: generator.name,
      timestamp: new Date(),
      data: { action: 'generator_registered', generator: generator.getInfo() }
    });
  }

  unregisterGenerator(name: string): void {
    const generator = this._generators.get(name);
    if (generator) {
      this._service.unregisterGenerator(name);
      this._generators.delete(name);

      this._emitEvent({
        type: 'config_update',
        generatorName: name,
        timestamp: new Date(),
        data: { action: 'generator_unregistered' }
      });
    }
  }

  // Service access
  getService(): AnnotationService {
    return this._service;
  }

  // Generator information
  getAvailableGenerators(): CaptionGenerator[] {
    return this._service.getAvailableGenerators();
  }

  getGenerator(name: string): CaptionGenerator | undefined {
    return this._service.getGenerator(name);
  }

  isGeneratorAvailable(name: string): boolean {
    return this._service.isGeneratorAvailable(name);
  }

  // Model management
  async preloadModel(name: string): Promise<void> {
    this._emitEvent({
      type: 'model_load',
      generatorName: name,
      timestamp: new Date(),
      data: { action: 'preload_started' }
    });

    try {
      await this._service.preloadModel(name);

      this._emitEvent({
        type: 'model_load',
        generatorName: name,
        timestamp: new Date(),
        data: { action: 'preload_completed' }
      });
    } catch (error) {
      this._emitEvent({
        type: 'model_load',
        generatorName: name,
        timestamp: new Date(),
        data: { 
          action: 'preload_failed',
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  async unloadModel(name: string): Promise<void> {
    this._emitEvent({
      type: 'model_unload',
      generatorName: name,
      timestamp: new Date(),
      data: { action: 'unload_started' }
    });

    try {
      await this._service.unloadModel(name);

      this._emitEvent({
        type: 'model_unload',
        generatorName: name,
        timestamp: new Date(),
        data: { action: 'unload_completed' }
      });
    } catch (error) {
      this._emitEvent({
        type: 'model_unload',
        generatorName: name,
        timestamp: new Date(),
        data: { 
          action: 'unload_failed',
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  // Configuration management
  updateGeneratorConfig(name: string, config: CaptionGeneratorConfig): void {
    this._service.updateGeneratorConfig(name, config);

    this._emitEvent({
      type: 'config_update',
      generatorName: name,
      timestamp: new Date(),
      data: { action: 'config_updated', config }
    });
  }

  getGeneratorConfig(name: string): CaptionGeneratorConfig | undefined {
    return this._service.getGeneratorConfig(name);
  }

  // Service status
  getServiceStatus(): {
    isRunning: boolean;
    activeTasks: number;
    queuedTasks: number;
    totalProcessed: number;
    averageProcessingTime: number;
  } {
    const stats = this._service.getStatistics();
    
    return {
      isRunning: this._isRunning,
      activeTasks: stats.activeTasks,
      queuedTasks: 0, // Not implemented in current version
      totalProcessed: stats.totalProcessed,
      averageProcessingTime: stats.averageProcessingTime
    };
  }

  // Event handling
  addEventListener(handler: AnnotationEventHandler): void {
    this._eventHandlers.add(handler);
  }

  removeEventListener(handler: AnnotationEventHandler): void {
    this._eventHandlers.delete(handler);
  }

  private _emitEvent(event: AnnotationEvent): void {
    for (const handler of this._eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in annotation event handler:', error);
      }
    }
  }

  // State management
  getState(): AnnotationManagerState {
    const generators: Record<string, CaptionGenerator> = {};
    for (const [name, generator] of this._generators) {
      generators[name] = generator.getInfo();
    }

    const stats = this._service.getStatistics();

    return {
      generators,
      activeTasks: stats.activeTasks,
      queuedTasks: 0,
      totalProcessed: stats.totalProcessed,
      averageProcessingTime: stats.averageProcessingTime,
      isRunning: this._isRunning,
      lastUpdate: new Date()
    };
  }

  // Lifecycle management
  async start(): Promise<void> {
    if (this._isRunning) {
      return;
    }

    this._isRunning = true;

    // Initialize all registered generators
    for (const generator of this._generators.values()) {
      if (!generator.isLoaded) {
        try {
          await generator.initialize();
        } catch (error) {
          console.warn(`Failed to initialize generator ${generator.name}:`, error);
        }
      }
    }
  }

  async stop(): Promise<void> {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;

    // Unload all generators
    for (const generator of this._generators.values()) {
      if (generator.isLoaded) {
        try {
          await generator.destroy();
        } catch (error) {
          console.warn(`Failed to unload generator ${generator.name}:`, error);
        }
      }
    }
  }

  // Utility methods
  getGeneratorCount(): number {
    return this._generators.size;
  }

  getLoadedGeneratorCount(): number {
    return Array.from(this._generators.values()).filter(g => g.isLoaded).length;
  }

  getAvailableGeneratorCount(): number {
    return Array.from(this._generators.values()).filter(g => g.isAvailable).length;
  }

  // Cleanup
  async destroy(): Promise<void> {
    await this.stop();
    await this._service.destroy();
    this._generators.clear();
    this._eventHandlers.clear();
  }
}
