/**
 * Circuit Breaker Implementation
 *
 * Implements the circuit breaker pattern to prevent cascading failures
 * and provide automatic recovery mechanisms.
 */

export type CircuitBreakerState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  enabled: boolean;
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private config: Required<CircuitBreakerConfig>;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      recoveryTimeout: config.recoveryTimeout ?? 60000, // 1 minute
      enabled: config.enabled ?? true,
    };
  }

  /**
   * Check if the circuit breaker allows the request to proceed
   */
  canExecute(): boolean {
    if (!this.config.enabled) return true;

    if (this.state === "open") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.config.recoveryTimeout) {
        return false;
      } else {
        this.state = "half-open";
      }
    }

    return true;
  }

  /**
   * Record a successful execution
   */
  recordSuccess(): void {
    if (!this.config.enabled) return;

    if (this.state === "half-open") {
      this.state = "closed";
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed execution
   */
  recordFailure(): void {
    if (!this.config.enabled) return;

    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = "open";
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CircuitBreakerConfig>): void {
    Object.assign(this.config, newConfig);
  }
}
