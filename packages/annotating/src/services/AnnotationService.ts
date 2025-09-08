/**
 * Annotation Service
 * 
 * Main service for handling caption generation and annotation workflows.
 */

import { 
  AnnotationService as IAnnotationService, 
  CaptionResult, 
  CaptionTask, 
  CaptionGenerator, 
  AnnotationProgress,
  CaptionGeneratorConfig
} from '../types/index.js';
import { BaseCaptionGenerator } from '../generators/BaseCaptionGenerator.js';
import { BackendIntegrationService } from './BackendIntegrationService.js';

export class AnnotationService implements IAnnotationService {
  private _generators: Map<string, BaseCaptionGenerator> = new Map();
  private _activeTasks: Set<string> = new Set();
  private _totalProcessed: number = 0;
  private _totalProcessingTime: number = 0;
  private _backendService: BackendIntegrationService;
  private _useBackend: boolean = true;

  constructor(backendUrl?: string, apiKey?: string) {
    this._backendService = new BackendIntegrationService(backendUrl, apiKey);
    // Initialize with default generators
    this._initializeDefaultGenerators();
  }

  async generateCaption(task: CaptionTask): Promise<CaptionResult> {
    if (this._useBackend) {
      try {
        // Use backend service for caption generation
        const backendRequest = this._backendService.convertToBackendRequest(task);
        const backendResponse = await this._backendService.generateCaption(backendRequest);
        const result = this._backendService.convertToFrontendResult(backendResponse);
        
        // Update statistics
        this._totalProcessed++;
        this._totalProcessingTime += result.processingTime;
        
        return result;
      } catch (error) {
        return {
          imagePath: task.imagePath,
          generatorName: task.generatorName,
          success: false,
          caption: '',
          processingTime: 0,
          captionType: 'caption' as any,
          error: `Backend generation failed: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }

    // Fallback to local generators
    const generator = this._generators.get(task.generatorName);
    if (!generator) {
      return {
        imagePath: task.imagePath,
        generatorName: task.generatorName,
        success: false,
        caption: '',
        processingTime: 0,
        captionType: 'caption' as any,
        error: `Generator '${task.generatorName}' not found`
      };
    }

    if (!generator.isLoaded) {
      try {
        await generator.initialize(task.config);
      } catch (error) {
        return {
          imagePath: task.imagePath,
          generatorName: task.generatorName,
          success: false,
          caption: '',
          processingTime: 0,
          captionType: generator.captionType,
          error: `Failed to initialize generator: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }

    const taskId = `${task.generatorName}-${Date.now()}-${Math.random()}`;
    this._activeTasks.add(taskId);

    try {
      const result = await generator.generateCaption(task);
      
      // Update statistics
      this._totalProcessed++;
      this._totalProcessingTime += result.processingTime;

      return result;
    } finally {
      this._activeTasks.delete(taskId);
    }
  }

  async generateBatchCaptions(
    tasks: CaptionTask[], 
    progressCallback?: (progress: AnnotationProgress) => void
  ): Promise<CaptionResult[]> {
    const startTime = new Date();
    const results: CaptionResult[] = [];
    let completed = 0;
    let failed = 0;

    const progress: AnnotationProgress = {
      total: tasks.length,
      completed: 0,
      failed: 0,
      progress: 0,
      startTime
    };

    // Initialize progress
    if (progressCallback) {
      progressCallback(progress);
    }

    // Process tasks in batches to avoid overwhelming the system
    const batchSize = 4;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      
      // Process batch concurrently
      const batchPromises = batch.map(async (task) => {
        try {
          const result = await this.generateCaption(task);
          if (result.success) {
            completed++;
          } else {
            failed++;
          }
          return result;
        } catch (error) {
          failed++;
          return {
            imagePath: task.imagePath,
            generatorName: task.generatorName,
            success: false,
            caption: '',
            processingTime: 0,
            captionType: 'caption' as any,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Update progress
      progress.completed = completed;
      progress.failed = failed;
      progress.progress = Math.round(((completed + failed) / tasks.length) * 100);
      progress.current = batch[batch.length - 1]?.imagePath;

      // Calculate estimated time remaining
      if (completed + failed > 0) {
        const elapsed = Date.now() - startTime.getTime();
        const rate = (completed + failed) / elapsed;
        const remaining = tasks.length - (completed + failed);
        progress.estimatedTimeRemaining = Math.round(remaining / rate);
      }

      if (progressCallback) {
        progressCallback(progress);
      }
    }

    return results;
  }

  async getAvailableGenerators(): Promise<CaptionGenerator[]> {
    if (this._useBackend) {
      try {
        const backendGenerators = await this._backendService.getAvailableGenerators();
        return backendGenerators.map(gen => this._backendService.convertToFrontendGenerator(gen));
      } catch (error) {
        console.warn('Failed to get generators from backend, falling back to local:', error);
        // Fallback to local generators
      }
    }
    
    return Array.from(this._generators.values()).map(generator => generator.getInfo());
  }

  getGenerator(name: string): CaptionGenerator | undefined {
    const generator = this._generators.get(name);
    return generator ? generator.getInfo() : undefined;
  }

  isGeneratorAvailable(name: string): boolean {
    const generator = this._generators.get(name);
    return generator ? generator.isAvailable : false;
  }

  isModelLoaded(name: string): boolean {
    const generator = this._generators.get(name);
    return generator ? generator.isLoaded : false;
  }

  updateGeneratorConfig(name: string, config: CaptionGeneratorConfig): void {
    const generator = this._generators.get(name);
    if (generator) {
      generator.updateConfig(config);
    }
  }

  getGeneratorConfig(name: string): CaptionGeneratorConfig | undefined {
    const generator = this._generators.get(name);
    return generator ? generator.getConfig() : undefined;
  }

  async preloadModel(name: string): Promise<void> {
    const generator = this._generators.get(name);
    if (!generator) {
      throw new Error(`Generator '${name}' not found`);
    }

    if (!generator.isLoaded) {
      await generator.initialize();
    }
  }

  async unloadModel(name: string): Promise<void> {
    const generator = this._generators.get(name);
    if (!generator) {
      throw new Error(`Generator '${name}' not found`);
    }

    if (generator.isLoaded) {
      await generator.destroy();
    }
  }

  // Generator management
  registerGenerator(generator: BaseCaptionGenerator): void {
    this._generators.set(generator.name, generator);
  }

  unregisterGenerator(name: string): void {
    const generator = this._generators.get(name);
    if (generator && generator.isLoaded) {
      generator.destroy();
    }
    this._generators.delete(name);
  }

  // Statistics
  getStatistics(): {
    totalGenerators: number;
    loadedGenerators: number;
    availableGenerators: number;
    activeTasks: number;
    totalProcessed: number;
    averageProcessingTime: number;
  } {
    const generators = Array.from(this._generators.values());
    const loadedGenerators = generators.filter(g => g.isLoaded).length;
    const availableGenerators = generators.filter(g => g.isAvailable).length;
    const averageProcessingTime = this._totalProcessed > 0 
      ? this._totalProcessingTime / this._totalProcessed 
      : 0;

    return {
      totalGenerators: generators.length,
      loadedGenerators,
      availableGenerators,
      activeTasks: this._activeTasks.size,
      totalProcessed: this._totalProcessed,
      averageProcessingTime
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    // Unload all generators
    for (const generator of this._generators.values()) {
      if (generator.isLoaded) {
        await generator.destroy();
      }
    }
    this._generators.clear();
    this._activeTasks.clear();
  }

  private _initializeDefaultGenerators(): void {
    // This would initialize default generators
    // For now, we'll create mock generators
    this._createMockGenerators();
  }

  private _createMockGenerators(): void {
    // Mock JTP2 generator
    const jtp2Generator = new (class extends BaseCaptionGenerator {
      constructor() {
        super(
          'jtp2',
          'Joint Tagger Project PILOT2 - Specialized tagger for furry artwork',
          '1.0.0',
          'tags' as any,
          {
            type: 'object',
            properties: {
              threshold: { type: 'number', minimum: 0, maximum: 1, default: 0.2 },
              forceCpu: { type: 'boolean', default: false }
            }
          },
          ['gpu_acceleration', 'batch_processing']
        );
      }

      async generate(imagePath: string, config?: CaptionGeneratorConfig): Promise<string> {
        // Mock generation
        return 'furry, anthro, digital art, colorful, detailed';
      }

      async checkAvailability(): Promise<boolean> {
        return true;
      }

      async load(config?: CaptionGeneratorConfig): Promise<void> {
        // Mock loading
        console.log('Loading JTP2 model...');
      }

      async unload(): Promise<void> {
        // Mock unloading
        console.log('Unloading JTP2 model...');
      }
    })();

    this.registerGenerator(jtp2Generator);

    // Mock JoyCaption generator
    const joyGenerator = new (class extends BaseCaptionGenerator {
      constructor() {
        super(
          'joycaption',
          'JoyCaption - Large language model for image captioning',
          '1.0.0',
          'caption' as any,
          {
            type: 'object',
            properties: {
              maxLength: { type: 'number', minimum: 1, maximum: 512, default: 256 },
              temperature: { type: 'number', minimum: 0, maximum: 2, default: 0.7 }
            }
          },
          ['gpu_acceleration', 'multilingual']
        );
      }

      async generate(imagePath: string, config?: CaptionGeneratorConfig): Promise<string> {
        // Mock generation
        return 'A beautiful furry character with vibrant colors and detailed artwork';
      }

      async checkAvailability(): Promise<boolean> {
        return true;
      }

      async load(config?: CaptionGeneratorConfig): Promise<void> {
        // Mock loading
        console.log('Loading JoyCaption model...');
      }

      async unload(): Promise<void> {
        // Mock unloading
        console.log('Unloading JoyCaption model...');
      }
    })();

    this.registerGenerator(joyGenerator);
  }
}
