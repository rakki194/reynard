export class RetryStrategy {
    constructor(maxAttempts = 3, baseDelaySec = 1) {
        Object.defineProperty(this, "maxAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxAttempts
        });
        Object.defineProperty(this, "baseDelaySec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: baseDelaySec
        });
    }
    async execute(fn) {
        let lastErr;
        for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
            try {
                return await fn();
            }
            catch (e) {
                lastErr = e;
                if (attempt < this.maxAttempts) {
                    const delayMs = this.calculateDelayMs(attempt);
                    await new Promise((r) => setTimeout(r, delayMs));
                }
            }
        }
        throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
    }
}
export class ExponentialBackoffRetry extends RetryStrategy {
    constructor(maxAttempts = 3, baseDelaySec = 1, multiplier = 2) {
        super(maxAttempts, baseDelaySec);
        Object.defineProperty(this, "multiplier", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: multiplier
        });
    }
    calculateDelayMs(attempt) {
        return this.baseDelaySec * 1000 * Math.pow(this.multiplier, attempt - 1);
    }
}
export class LinearBackoffRetry extends RetryStrategy {
    constructor(maxAttempts = 3, baseDelaySec = 1, incrementSec = 1) {
        super(maxAttempts, baseDelaySec);
        Object.defineProperty(this, "incrementSec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: incrementSec
        });
    }
    calculateDelayMs(attempt) {
        return (this.baseDelaySec + this.incrementSec * (attempt - 1)) * 1000;
    }
}
export class JitterRetry extends RetryStrategy {
    constructor(maxAttempts = 3, baseDelaySec = 1, jitterFactor = 0.1) {
        super(maxAttempts, baseDelaySec);
        Object.defineProperty(this, "jitterFactor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: jitterFactor
        });
    }
    calculateDelayMs(attempt) {
        const base = this.baseDelaySec * 1000 * Math.pow(2, attempt - 1);
        const jitter = base * this.jitterFactor * Math.random();
        return base + jitter;
    }
}
