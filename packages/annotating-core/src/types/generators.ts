/**
 * Generator and model interfaces for Reynard annotation system
 *
 * This module defines interfaces for caption generators,
 * model management, and related functionality.
 */

import type { CaptionType } from "reynard-ai-shared";
import { ModelCategory, ModelStatus } from "./enums";

export interface CaptionGenerator {
  name: string;
  description: string;
  version: string;
  captionType: CaptionType;
  modelCategory: ModelCategory;
  isAvailable: boolean;
  isLoaded: boolean;
  status: ModelStatus;
  configSchema: Record<string, any>;
  features: string[];
  metadata?: Record<string, any>;
  // Production features
  usageStats?: ModelUsageStats;
  downloadProgress?: DownloadProgress;
  healthStatus?: HealthStatus;
}

export interface ModelUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  lastUsed: Date;
  memoryUsage?: number;
  gpuUsage?: number;
}

export interface DownloadProgress {
  isDownloading: boolean;
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  eta: number; // estimated time remaining in seconds
}

export interface HealthStatus {
  isHealthy: boolean;
  lastHealthCheck: Date;
  issues: string[];
  performance: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}
