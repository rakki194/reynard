/**
 * HTTP Client Core Implementation
 *
 * Core HTTP client functionality with modular architecture.
 * This is the main orchestrator that coordinates all components.
 */

import {
  HTTPClientConfig,
  HTTPRequestOptions,
  HTTPResponse,
  HTTPMetrics,
} from "./types";
import { HTTPMiddleware } from "./middleware-types";
import { CircuitBreaker } from "./circuit-breaker";
import { RetryHandler } from "./retry-handler";
import { MetricsTracker } from "./metrics-tracker";
import { MiddlewareManager } from "./middleware-manager";
import { ConfigManager } from "./config-manager";
import { RequestHandler } from "./request-handler";
import { RequestExecutor } from "./request-executor";

export class HTTPClientCore {
  private configManager: ConfigManager;
  private circuitBreaker: CircuitBreaker;
  private retryHandler: RetryHandler;
  private metricsTracker: MetricsTracker;
  private middlewareManager: MiddlewareManager;
  private requestHandler: RequestHandler;

  constructor(config: HTTPClientConfig) {
    // Initialize configuration manager
    this.configManager = new ConfigManager(config);
    const configData = this.configManager.getConfig();

    // Initialize components
    this.circuitBreaker = new CircuitBreaker({
      enabled: configData.enableCircuitBreaker,
    });
    this.retryHandler = new RetryHandler({
      enabled: configData.enableRetry,
      maxRetries: configData.retries,
    });
    this.metricsTracker = new MetricsTracker({
      enabled: configData.enableMetrics,
    });
    this.middlewareManager = new MiddlewareManager(configData.middleware);
    const requestExecutor = new RequestExecutor();
    this.requestHandler = new RequestHandler(
      this.circuitBreaker,
      this.retryHandler,
      this.metricsTracker,
      this.middlewareManager,
      requestExecutor
    );
  }

  /**
   * Make HTTP request with retry logic and middleware
   */
  async request<T = unknown>(options: HTTPRequestOptions): Promise<HTTPResponse<T>> {
    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      throw this.retryHandler.createError("Circuit breaker is open", options, 503, Date.now());
    }

    // Apply request middleware
    const processedOptions = await this.middlewareManager.processRequest(options);

    const url = this.configManager.buildUrl(processedOptions.endpoint, processedOptions.params);
    const headers = { ...this.configManager.getBaseHeaders(), ...processedOptions.headers };
    const configData = this.configManager.getConfig();
    const timeout = processedOptions.timeout ?? configData.timeout;
    const retries = processedOptions.retries ?? configData.retries;

    return this.requestHandler.executeRequest<T>(processedOptions, url, headers, timeout, retries);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HTTPClientConfig>): void {
    this.configManager.updateConfig(newConfig);
  }

  /**
   * Get current metrics
   */
  getMetrics(): HTTPMetrics {
    return this.metricsTracker.getMetrics();
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metricsTracker.reset();
  }

  /**
   * Add middleware
   */
  addMiddleware(middleware: HTTPMiddleware): void {
    this.middlewareManager.addMiddleware(middleware);
  }

  /**
   * Remove middleware
   */
  removeMiddleware(middleware: HTTPMiddleware): void {
    this.middlewareManager.removeMiddleware(middleware);
  }

  /**
   * Clear all middleware
   */
  clearMiddleware(): void {
    this.middlewareManager.clearMiddleware();
  }
}
