import { ConnectionMetrics as Metrics } from './types';

export class ConnectionMetricsTracker {
  private windowSize: number;
  private responseTimes: number[] = [];
  private errorCounts: Record<string, number> = {};
  private success = 0;
  private failed = 0;
  private startTime = Date.now();
  private lastRequest?: number;
  private lastResponse?: number;

  constructor(windowSize = 100) {
    this.windowSize = windowSize;
  }

  record(responseTime: number, success: boolean, errorType?: string) {
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.windowSize) this.responseTimes.shift();
    this.lastRequest = Date.now();
    if (success) {
      this.success += 1;
      this.lastResponse = Date.now();
    } else {
      this.failed += 1;
      if (errorType) this.errorCounts[errorType] = (this.errorCounts[errorType] ?? 0) + 1;
    }
  }

  averageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  errorRate(): number {
    const total = this.success + this.failed;
    return total === 0 ? 0 : (this.failed / total) * 100;
  }

  throughput(windowSeconds = 60): number {
    // Basic estimate based on successes in the window; lightweight on frontend
    const total = this.success + this.failed;
    if (total === 0) return 0;
    const elapsed = Math.max(1, (Date.now() - this.startTime) / 1000);
    return total / Math.min(elapsed, windowSeconds);
  }

  uptime(): number {
    const total = this.success + this.failed;
    if (total === 0) return 100;
    return 100 - this.errorRate();
  }

  summary(): Record<string, unknown> {
    return {
      average_response_time: this.averageResponseTime(),
      error_rate: this.errorRate(),
      throughput: this.throughput(),
      uptime: this.uptime(),
      total_requests: this.success + this.failed,
      successful_requests: this.success,
      failed_requests: this.failed,
      error_breakdown: { ...this.errorCounts },
      start_time: new Date(this.startTime).toISOString(),
      last_request: this.lastRequest ? new Date(this.lastRequest).toISOString() : null,
      last_response: this.lastResponse ? new Date(this.lastResponse).toISOString() : null,
    };
  }
}
