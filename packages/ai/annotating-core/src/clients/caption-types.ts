/**
 * Caption Generation Types for Reynard Annotating
 *
 * Contains all interfaces and types specific to caption generation operations.
 * These types are used by the CaptionApiClient and related services.
 */

// Import types from specialized modules
import type { JsonSchema } from "./json-schema-types";
import type { GeneratorConfig } from "./generator-config-types";
import type { HealthDetails, QueueStatus, UsageStats } from "./monitoring-types";

// Re-export types from specialized modules
export type { JsonSchema, JsonSchemaProperty } from "./json-schema-types";
export type {
  GeneratorConfig,
  BaseGeneratorConfig,
  JoyCaptionConfig,
  Florence2Config,
  JTP2Config,
  WDv3Config,
} from "./generator-config-types";
export type {
  PerformanceMetrics,
  HealthDetails,
  QueueStatus,
  CircuitBreakerState,
  UsageStats,
} from "./monitoring-types";

export interface CaptionApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  serviceName?: string;
  version?: string;
}

export interface CaptionRequest {
  image_path: string;
  generator_name: string;
  config?: GeneratorConfig;
  force?: boolean;
  post_process?: boolean;
}

export interface BatchCaptionRequest {
  tasks: CaptionRequest[];
  max_concurrent?: number;
}

export interface GeneratorInfo {
  name: string;
  description: string;
  version: string;
  caption_type: string;
  model_category: string;
  is_available: boolean;
  is_loaded: boolean;
  status: string;
  config_schema: JsonSchema;
  features: string[];
  metadata?: Record<string, string | number | boolean>;
}

export interface CaptionResponse {
  success: boolean;
  image_path: string;
  generator_name: string;
  caption?: string;
  error?: string;
  error_type?: string;
  retryable?: boolean;
  processing_time?: number;
  caption_type?: string;
}

export interface SystemStats {
  total_processed: number;
  total_processing_time: number;
  average_processing_time: number;
  active_tasks: number;
  loaded_models: number;
  available_generators: number;
  usage_stats: Record<string, UsageStats>;
  health_status: HealthDetails;
  queue_status: QueueStatus;
}

export interface ModelUsageStats {
  total_requests: number;
  total_processing_time: number;
  average_processing_time: number;
  success_rate: number;
  error_count: number;
  last_used?: string;
  model_size?: number;
  memory_usage?: number;
}

export interface HealthStatus {
  isHealthy: boolean;
  status: string;
  timestamp: number;
  version?: string;
  serviceName?: string;
  details?: HealthDetails;
}
