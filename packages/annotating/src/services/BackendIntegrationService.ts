/**
 * Backend Integration Service
 * 
 * This service provides integration between the Reynard frontend annotating package
 * and the backend caption generation services. It handles API communication,
 * model management, and provides a unified interface for caption generation.
 */

import { 
  CaptionResult, 
  CaptionTask, 
  CaptionGenerator, 
  CaptionGeneratorConfig,
  AnnotationProgress
} from '../types/index.js';

export interface BackendGeneratorInfo {
  name: string;
  description: string;
  version: string;
  caption_type: string;
  is_available: boolean;
  is_loaded: boolean;
  config_schema: Record<string, any>;
  features: string[];
  model_category: string;
}

export interface BackendCaptionRequest {
  image_path: string;
  generator_name: string;
  config?: Record<string, any>;
  force?: boolean;
  post_process?: boolean;
}

export interface BackendCaptionResponse {
  success: boolean;
  image_path: string;
  generator_name: string;
  caption?: string;
  error?: string;
  error_type?: string;
  retryable: boolean;
  processing_time?: number;
  caption_type?: string;
}

export interface BackendBatchRequest {
  tasks: BackendCaptionRequest[];
  max_concurrent?: number;
}

export class BackendIntegrationService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'http://localhost:8000/api', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get all available caption generators from the backend.
   */
  async getAvailableGenerators(): Promise<BackendGeneratorInfo[]> {
    try {
      const response = await this.makeRequest('/caption/generators', 'GET');
      return Object.values(response);
    } catch (error) {
      console.error('Failed to get available generators:', error);
      throw new Error(`Failed to get available generators: ${error}`);
    }
  }

  /**
   * Get information about a specific generator.
   */
  async getGeneratorInfo(generatorName: string): Promise<BackendGeneratorInfo> {
    try {
      const response = await this.makeRequest(`/caption/generators/${generatorName}`, 'GET');
      return response;
    } catch (error) {
      console.error(`Failed to get generator info for ${generatorName}:`, error);
      throw new Error(`Failed to get generator info: ${error}`);
    }
  }

  /**
   * Generate a caption for a single image.
   */
  async generateCaption(request: BackendCaptionRequest): Promise<BackendCaptionResponse> {
    try {
      const response = await this.makeRequest('/caption/generate', 'POST', request);
      return response;
    } catch (error) {
      console.error('Failed to generate caption:', error);
      throw new Error(`Failed to generate caption: ${error}`);
    }
  }

  /**
   * Generate captions for multiple images in batch.
   */
  async generateBatchCaptions(
    request: BackendBatchRequest,
    progressCallback?: (progress: AnnotationProgress) => void
  ): Promise<BackendCaptionResponse[]> {
    try {
      // For now, we'll process sequentially with progress updates
      // In a real implementation, this would use WebSockets or Server-Sent Events
      const results: BackendCaptionResponse[] = [];
      const total = request.tasks.length;
      let completed = 0;

      for (const task of request.tasks) {
        try {
          const result = await this.generateCaption(task);
          results.push(result);
          completed++;

          if (progressCallback) {
            progressCallback({
              total,
              completed,
              failed: results.filter(r => !r.success).length,
              progress: Math.round((completed / total) * 100),
              startTime: new Date()
            });
          }
        } catch (error) {
          const errorResult: BackendCaptionResponse = {
            success: false,
            image_path: task.image_path,
            generator_name: task.generator_name,
            error: error instanceof Error ? error.message : String(error),
            error_type: 'generation_failed',
            retryable: true
          };
          results.push(errorResult);
          completed++;

          if (progressCallback) {
            progressCallback({
              total,
              completed,
              failed: results.filter(r => !r.success).length,
              progress: Math.round((completed / total) * 100),
              startTime: new Date()
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to generate batch captions:', error);
      throw new Error(`Failed to generate batch captions: ${error}`);
    }
  }

  /**
   * Load a specific model.
   */
  async loadModel(generatorName: string, config?: Record<string, any>): Promise<void> {
    try {
      await this.makeRequest(`/caption/models/${generatorName}/load`, 'POST', { config });
    } catch (error) {
      console.error(`Failed to load model ${generatorName}:`, error);
      throw new Error(`Failed to load model: ${error}`);
    }
  }

  /**
   * Unload a specific model.
   */
  async unloadModel(generatorName: string): Promise<void> {
    try {
      await this.makeRequest(`/caption/models/${generatorName}/unload`, 'POST');
    } catch (error) {
      console.error(`Failed to unload model ${generatorName}:`, error);
      throw new Error(`Failed to unload model: ${error}`);
    }
  }

  /**
   * Get list of currently loaded models.
   */
  async getLoadedModels(): Promise<string[]> {
    try {
      const response = await this.makeRequest('/caption/models/loaded', 'GET');
      return response.loaded_models || [];
    } catch (error) {
      console.error('Failed to get loaded models:', error);
      throw new Error(`Failed to get loaded models: ${error}`);
    }
  }

  /**
   * Upload an image and generate a caption for it.
   */
  async uploadAndGenerateCaption(
    file: File,
    generatorName: string,
    config?: Record<string, any>,
    force: boolean = false,
    postProcess: boolean = true
  ): Promise<BackendCaptionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('generator_name', generatorName);
      formData.append('force', force.toString());
      formData.append('post_process', postProcess.toString());
      
      if (config) {
        formData.append('config', JSON.stringify(config));
      }

      const response = await this.makeRequest('/caption/upload', 'POST', formData, true);
      return response;
    } catch (error) {
      console.error('Failed to upload and generate caption:', error);
      throw new Error(`Failed to upload and generate caption: ${error}`);
    }
  }

  /**
   * Make an HTTP request to the backend API.
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
    isFormData: boolean = false
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    if (!isFormData && data) {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      headers
    };

    if (data) {
      if (isFormData) {
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Convert backend generator info to frontend generator format.
   */
  convertToFrontendGenerator(backendInfo: BackendGeneratorInfo): CaptionGenerator {
    return {
      name: backendInfo.name,
      description: backendInfo.description,
      version: backendInfo.version,
      captionType: backendInfo.caption_type as any,
      isAvailable: backendInfo.is_available,
      isLoaded: backendInfo.is_loaded,
      configSchema: backendInfo.config_schema,
      features: backendInfo.features,
      metadata: {
        model_category: backendInfo.model_category
      }
    };
  }

  /**
   * Convert frontend caption task to backend request format.
   */
  convertToBackendRequest(task: CaptionTask): BackendCaptionRequest {
    return {
      image_path: task.imagePath,
      generator_name: task.generatorName,
      config: task.config,
      force: task.force,
      post_process: task.postProcess
    };
  }

  /**
   * Convert backend caption response to frontend result format.
   */
  convertToFrontendResult(backendResponse: BackendCaptionResponse): CaptionResult {
    return {
      imagePath: backendResponse.image_path,
      generatorName: backendResponse.generator_name,
      success: backendResponse.success,
      caption: backendResponse.caption || '',
      processingTime: backendResponse.processing_time || 0,
      captionType: backendResponse.caption_type as any,
      error: backendResponse.error,
      metadata: {
        error_type: backendResponse.error_type,
        retryable: backendResponse.retryable
      }
    };
  }
}
