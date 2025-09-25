/**
 * 🦊 Diffusion-Pipe API Client
 *
 * Comprehensive API client for diffusion-pipe training operations
 * with authentication, error handling, and retry logic.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { DiffusionPipeConfig, createConfig, validateConfig } from "./DiffusionPipeConfig";
import {
  TrainingRequest,
  TrainingStatus,
  TrainingMetrics,
  ModelInfo,
  CheckpointInfo,
  ChromaTrainingConfig,
  DatasetConfig,
  ApiResponse,
  PaginatedResponse,
  TrainingProfile,
} from "../types";
import { DIFFUSION_PIPE_ENDPOINTS, DEFAULT_CONFIGS, TIMEOUTS } from "../constants";
import {
  DiffusionPipeError,
  TrainingError,
  ConfigValidationError,
  ModelNotFoundError,
  DatasetNotFoundError,
  PermissionDeniedError,
  RateLimitError,
  NetworkError,
  TimeoutError,
} from "../errors";

/**
 * Main diffusion-pipe API client
 */
export class DiffusionPipeClient {
  private config: Required<DiffusionPipeConfig>;
  private abortController?: AbortController;

  constructor(config: Partial<DiffusionPipeConfig> = {}) {
    const validationErrors = validateConfig(config);
    if (validationErrors.length > 0) {
      throw new ConfigValidationError("Invalid configuration", validationErrors, { config });
    }

    this.config = createConfig(config);
  }

  /**
   * Start a new training session
   */
  async startTraining(request: TrainingRequest): Promise<TrainingStatus> {
    try {
      const response = await this.makeRequest<TrainingStatus>("POST", DIFFUSION_PIPE_ENDPOINTS.TRAIN, request);

      if (!response.success || !response.data) {
        throw new TrainingError(response.error || "Failed to start training", undefined, "TRAINING_START_FAILED", {
          request,
          response,
        });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new TrainingError("Failed to start training", undefined, "TRAINING_START_FAILED", {
        request,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get list of training sessions
   */
  async getTrainings(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<TrainingStatus>> {
    try {
      const response = await this.makeRequest<PaginatedResponse<TrainingStatus>>(
        "GET",
        `${DIFFUSION_PIPE_ENDPOINTS.TRAININGS}?page=${page}&page_size=${pageSize}`
      );

      if (!response.success || !response.data) {
        throw new DiffusionPipeError(response.error || "Failed to get trainings", "GET_TRAININGS_FAILED", 500, {
          page,
          pageSize,
          response,
        });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new DiffusionPipeError("Failed to get trainings", "GET_TRAININGS_FAILED", 500, {
        page,
        pageSize,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get training status by ID
   */
  async getTrainingStatus(trainingId: string): Promise<TrainingStatus> {
    try {
      const response = await this.makeRequest<TrainingStatus>(
        "GET",
        DIFFUSION_PIPE_ENDPOINTS.TRAINING_BY_ID(trainingId)
      );

      if (!response.success || !response.data) {
        throw new TrainingError(response.error || "Training not found", trainingId, "TRAINING_NOT_FOUND", {
          trainingId,
          response,
        });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new TrainingError("Failed to get training status", trainingId, "GET_TRAINING_STATUS_FAILED", {
        trainingId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Cancel/stop a training session
   */
  async cancelTraining(trainingId: string): Promise<void> {
    try {
      const response = await this.makeRequest<void>("DELETE", DIFFUSION_PIPE_ENDPOINTS.TRAINING_BY_ID(trainingId));

      if (!response.success) {
        throw new TrainingError(response.error || "Failed to cancel training", trainingId, "CANCEL_TRAINING_FAILED", {
          trainingId,
          response,
        });
      }
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new TrainingError("Failed to cancel training", trainingId, "CANCEL_TRAINING_FAILED", {
        trainingId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Resume training from checkpoint
   */
  async resumeTraining(trainingId: string): Promise<TrainingStatus> {
    try {
      const response = await this.makeRequest<TrainingStatus>(
        "POST",
        DIFFUSION_PIPE_ENDPOINTS.TRAINING_RESUME(trainingId)
      );

      if (!response.success || !response.data) {
        throw new TrainingError(response.error || "Failed to resume training", trainingId, "RESUME_TRAINING_FAILED", {
          trainingId,
          response,
        });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new TrainingError("Failed to resume training", trainingId, "RESUME_TRAINING_FAILED", {
        trainingId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get supported models
   */
  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.makeRequest<ModelInfo[]>("GET", DIFFUSION_PIPE_ENDPOINTS.MODELS);

      if (!response.success || !response.data) {
        throw new DiffusionPipeError(response.error || "Failed to get models", "GET_MODELS_FAILED", 500, { response });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new DiffusionPipeError("Failed to get models", "GET_MODELS_FAILED", 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get model information by type
   */
  async getModelInfo(modelType: string): Promise<ModelInfo> {
    try {
      const response = await this.makeRequest<ModelInfo>("GET", DIFFUSION_PIPE_ENDPOINTS.MODEL_BY_TYPE(modelType));

      if (!response.success || !response.data) {
        throw new ModelNotFoundError(modelType, { response });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new ModelNotFoundError(modelType, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Validate training configuration
   */
  async validateConfig(config: any): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await this.makeRequest<{ valid: boolean; errors: string[] }>(
        "POST",
        DIFFUSION_PIPE_ENDPOINTS.VALIDATE_CONFIG,
        config
      );

      if (!response.success || !response.data) {
        throw new ConfigValidationError(
          response.error || "Configuration validation failed",
          [response.error || "Unknown validation error"],
          { config, response }
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new ConfigValidationError(
        "Configuration validation failed",
        [error instanceof Error ? error.message : String(error)],
        { config, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Get configuration templates
   */
  async getTemplates(): Promise<TrainingProfile[]> {
    try {
      const response = await this.makeRequest<TrainingProfile[]>("GET", DIFFUSION_PIPE_ENDPOINTS.TEMPLATES);

      if (!response.success || !response.data) {
        throw new DiffusionPipeError(response.error || "Failed to get templates", "GET_TEMPLATES_FAILED", 500, {
          response,
        });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new DiffusionPipeError("Failed to get templates", "GET_TEMPLATES_FAILED", 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get training metrics
   */
  async getMetrics(trainingId?: string): Promise<TrainingMetrics[]> {
    try {
      const url = trainingId
        ? `${DIFFUSION_PIPE_ENDPOINTS.METRICS}?training_id=${trainingId}`
        : DIFFUSION_PIPE_ENDPOINTS.METRICS;

      const response = await this.makeRequest<TrainingMetrics[]>("GET", url);

      if (!response.success || !response.data) {
        throw new DiffusionPipeError(response.error || "Failed to get metrics", "GET_METRICS_FAILED", 500, {
          trainingId,
          response,
        });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new DiffusionPipeError("Failed to get metrics", "GET_METRICS_FAILED", 500, {
        trainingId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get training logs
   */
  async getLogs(trainingId: string): Promise<string[]> {
    try {
      const response = await this.makeRequest<string[]>("GET", DIFFUSION_PIPE_ENDPOINTS.LOGS(trainingId));

      if (!response.success || !response.data) {
        throw new TrainingError(response.error || "Failed to get logs", trainingId, "GET_LOGS_FAILED", {
          trainingId,
          response,
        });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new TrainingError("Failed to get logs", trainingId, "GET_LOGS_FAILED", {
        trainingId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.makeRequest<{ status: string; timestamp: string }>(
        "GET",
        DIFFUSION_PIPE_ENDPOINTS.HEALTH
      );

      if (!response.success || !response.data) {
        throw new DiffusionPipeError(response.error || "Health check failed", "HEALTH_CHECK_FAILED", 500, { response });
      }

      return response.data;
    } catch (error) {
      if (error instanceof DiffusionPipeError) {
        throw error;
      }
      throw new DiffusionPipeError("Health check failed", "HEALTH_CHECK_FAILED", 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get default Chroma E6AI 512 configuration
   */
  getDefaultChromaE6AI512Config(): ChromaTrainingConfig {
    return DEFAULT_CONFIGS.CHROMA_E6AI_512 as ChromaTrainingConfig;
  }

  /**
   * Get default Chroma E6AI 1024 configuration
   */
  getDefaultChromaE6AI1024Config(): ChromaTrainingConfig {
    return DEFAULT_CONFIGS.CHROMA_E6AI_1024 as ChromaTrainingConfig;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(method: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Create new abort controller for this request
        this.abortController = new AbortController();
        const timeoutId = setTimeout(() => this.abortController!.abort(), this.config.timeout);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...this.config.headers,
        };

        // Add authentication
        if (this.config.apiKey) {
          headers["X-API-Key"] = this.config.apiKey;
        }
        if (this.config.bearerToken) {
          headers["Authorization"] = `Bearer ${this.config.bearerToken}`;
        }

        const requestOptions: RequestInit = {
          method,
          headers,
          signal: this.abortController.signal,
        };

        if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
          requestOptions.body = JSON.stringify(data);
        }

        if (this.config.enableLogging) {
          console.log(`[DiffusionPipe] ${method} ${url}`, data);
        }

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw this.createErrorFromResponse(response, errorData);
        }

        const result = await response.json();

        if (this.config.enableLogging) {
          console.log(`[DiffusionPipe] Response:`, result);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof DiffusionPipeError) {
          throw error;
        }

        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw new NetworkError(url, method, `Request failed after ${this.config.maxRetries + 1} attempts`, undefined, {
      lastError: lastError?.message,
    });
  }

  /**
   * Create appropriate error from HTTP response
   */
  private createErrorFromResponse(response: Response, errorData: any): DiffusionPipeError {
    const status = response.status;
    const message = errorData.message || errorData.error || response.statusText;

    switch (status) {
      case 400:
        return new ConfigValidationError(message, errorData.errors || [message], errorData);
      case 401:
      case 403:
        return new PermissionDeniedError(message, errorData);
      case 404:
        if (message.includes("model")) {
          return new ModelNotFoundError("unknown", errorData);
        }
        if (message.includes("dataset")) {
          return new DatasetNotFoundError("unknown", errorData);
        }
        return new DiffusionPipeError(message, "NOT_FOUND", status, errorData);
      case 429:
        return new RateLimitError(message, errorData.retry_after, errorData);
      case 500:
        return new TrainingError(message, undefined, "TRAINING_FAILED", errorData);
      default:
        return new DiffusionPipeError(message, "HTTP_ERROR", status, errorData);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DiffusionPipeConfig>): void {
    const validationErrors = validateConfig(newConfig);
    if (validationErrors.length > 0) {
      throw new ConfigValidationError("Invalid configuration", validationErrors, { config: newConfig });
    }

    this.config = createConfig({ ...this.config, ...newConfig });
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<DiffusionPipeConfig> {
    return { ...this.config };
  }
}
