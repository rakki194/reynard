/**
 * Base Repository Service
 *
 * Abstract base class for all repository services providing common functionality
 * and lifecycle management.
 */

import { RepositoryError } from "../types/index.js";

export interface ServiceConfig {
  name: string;
  version: string;
  timeout?: number;
  retries?: number;
  healthCheckInterval?: number;
}

export interface ServiceStatus {
  name: string;
  version: string;
  status: "initializing" | "healthy" | "degraded" | "unhealthy" | "shutdown";
  lastCheck: Date;
  uptime: number;
  metadata?: Record<string, any>;
}

export abstract class BaseRepositoryService {
  protected config: ServiceConfig;
  protected initialized = false;
  protected startTime?: Date;
  protected healthCheckTimer?: NodeJS.Timeout;

  constructor(config: ServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.onInitialize();
      this.initialized = true;
      this.startTime = new Date();

      // Start health check timer if configured
      if (this.config.healthCheckInterval) {
        this.startHealthCheck();
      }
    } catch (error) {
      throw new RepositoryError(`Failed to initialize ${this.config.name}`, "INITIALIZATION_ERROR", error);
    }
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Stop health check timer
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = undefined;
      }

      await this.onShutdown();
      this.initialized = false;
    } catch (error) {
      throw new RepositoryError(`Failed to shutdown ${this.config.name}`, "SHUTDOWN_ERROR", error);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<ServiceStatus> {
    if (!this.initialized) {
      return {
        name: this.config.name,
        version: this.config.version,
        status: "unhealthy",
        lastCheck: new Date(),
        uptime: 0,
        metadata: { error: "Service not initialized" },
      };
    }

    try {
      const health = await this.onHealthCheck();
      const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;

      return {
        name: this.config.name,
        version: this.config.name,
        status: health.healthy ? "healthy" : "degraded",
        lastCheck: new Date(),
        uptime,
        metadata: health.metadata,
      };
    } catch (error) {
      return {
        name: this.config.name,
        version: this.config.version,
        status: "unhealthy",
        lastCheck: new Date(),
        uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  /**
   * Check if service is initialized
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError(`${this.config.name} not initialized. Call initialize() first.`, "NOT_INITIALIZED");
    }
  }

  /**
   * Start health check timer
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.getHealthStatus();
      } catch (error) {
        console.warn(`Health check failed for ${this.config.name}:`, error);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract onInitialize(): Promise<void>;
  protected abstract onShutdown(): Promise<void>;
  protected abstract onHealthCheck(): Promise<{ healthy: boolean; metadata?: Record<string, any> }>;
}
