/**
 * Request Handler Implementation
 *
 * Handles the main request logic including retry loops, error handling,
 * and coordination between different components.
 */

import { HTTPRequestOptions, HTTPResponse, HTTPError } from "./types";
import { CircuitBreaker } from "./circuit-breaker";
import { RetryHandler } from "./retry-handler";
import { MetricsTracker } from "./metrics-tracker";
import { MiddlewareManager } from "./middleware-manager";
import { RequestExecutor } from "./request-executor";

export class RequestHandler {
  constructor(
    private circuitBreaker: CircuitBreaker,
    private retryHandler: RetryHandler,
    private metricsTracker: MetricsTracker,
    private middlewareManager: MiddlewareManager,
    private requestExecutor: RequestExecutor
  ) {}

  /**
   * Execute a request with full retry logic and error handling
   */
  async executeRequest<T>(
    options: HTTPRequestOptions,
    url: string,
    headers: Record<string, string>,
    timeout: number,
    retries: number
  ): Promise<HTTPResponse<T>> {
    const requestMetrics = this.metricsTracker.recordRequestStart();
    let lastError: HTTPError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.requestExecutor.executeRequest<T>(options, url, headers, timeout);
        const requestTime = Date.now() - requestMetrics.startTime;

        // Update the response with the actual request time
        response.requestTime = requestTime;

        // Update metrics and circuit breaker
        this.metricsTracker.recordSuccess(requestTime);
        this.circuitBreaker.recordSuccess();
        this.metricsTracker.updateCircuitBreakerState(this.circuitBreaker.getState());

        // Apply response middleware
        const processedResponse = await this.middlewareManager.processResponse(response);

        // Notify middleware of completion
        await this.middlewareManager.notifyCompletion(options, processedResponse);

        return processedResponse;
      } catch (error) {
        const requestTime = Date.now() - requestMetrics.startTime;

        const httpError = this.retryHandler.createError(
          error instanceof Error ? error.message : "Unknown error",
          options,
          error instanceof Error && "status" in error ? (error as Error & { status: number }).status : 0,
          requestMetrics.startTime,
          requestTime,
          attempt
        );

        // Apply error middleware
        const processedError = await this.middlewareManager.processError(httpError);
        lastError = processedError;

        // Check if we should retry
        if (attempt < retries && this.retryHandler.shouldRetry(processedError)) {
          const delay = this.retryHandler.calculateRetryDelay(attempt);
          await this.retryHandler.waitForRetry(delay);
          continue;
        }

        // Update circuit breaker and metrics on failure
        this.circuitBreaker.recordFailure();
        this.metricsTracker.recordError(requestTime);
        this.metricsTracker.updateCircuitBreakerState(this.circuitBreaker.getState());

        // Notify middleware of completion
        await this.middlewareManager.notifyCompletion(options, undefined, processedError);

        throw processedError;
      }
    }

    throw lastError!;
  }
}
