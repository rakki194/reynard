export class ConnectionMetricsTracker {
    constructor(windowSize = 100) {
        Object.defineProperty(this, "windowSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "responseTimes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "errorCounts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "success", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "failed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Date.now()
        });
        Object.defineProperty(this, "lastRequest", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastResponse", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.windowSize = windowSize;
    }
    record(responseTime, success, errorType) {
        this.responseTimes.push(responseTime);
        if (this.responseTimes.length > this.windowSize)
            this.responseTimes.shift();
        this.lastRequest = Date.now();
        if (success) {
            this.success += 1;
            this.lastResponse = Date.now();
        }
        else {
            this.failed += 1;
            if (errorType)
                this.errorCounts[errorType] = (this.errorCounts[errorType] ?? 0) + 1;
        }
    }
    averageResponseTime() {
        if (this.responseTimes.length === 0)
            return 0;
        return (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length);
    }
    errorRate() {
        const total = this.success + this.failed;
        return total === 0 ? 0 : (this.failed / total) * 100;
    }
    throughput(windowSeconds = 60) {
        // Basic estimate based on successes in the window; lightweight on frontend
        const total = this.success + this.failed;
        if (total === 0)
            return 0;
        const elapsed = Math.max(1, (Date.now() - this.startTime) / 1000);
        return total / Math.min(elapsed, windowSeconds);
    }
    uptime() {
        const total = this.success + this.failed;
        if (total === 0)
            return 100;
        return 100 - this.errorRate();
    }
    summary() {
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
            last_request: this.lastRequest
                ? new Date(this.lastRequest).toISOString()
                : null,
            last_response: this.lastResponse
                ? new Date(this.lastResponse).toISOString()
                : null,
        };
    }
}
