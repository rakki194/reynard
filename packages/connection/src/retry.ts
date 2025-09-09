export abstract class RetryStrategy {
  constructor(
    public maxAttempts = 3,
    public baseDelaySec = 1,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        if (attempt < this.maxAttempts) {
          const delayMs = this.calculateDelayMs(attempt);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  }

  protected abstract calculateDelayMs(attempt: number): number;
}

export class ExponentialBackoffRetry extends RetryStrategy {
  constructor(
    maxAttempts = 3,
    baseDelaySec = 1,
    private multiplier = 2,
  ) {
    super(maxAttempts, baseDelaySec);
  }
  protected calculateDelayMs(attempt: number): number {
    return this.baseDelaySec * 1000 * Math.pow(this.multiplier, attempt - 1);
  }
}

export class LinearBackoffRetry extends RetryStrategy {
  constructor(
    maxAttempts = 3,
    baseDelaySec = 1,
    private incrementSec = 1,
  ) {
    super(maxAttempts, baseDelaySec);
  }
  protected calculateDelayMs(attempt: number): number {
    return (this.baseDelaySec + this.incrementSec * (attempt - 1)) * 1000;
  }
}

export class JitterRetry extends RetryStrategy {
  constructor(
    maxAttempts = 3,
    baseDelaySec = 1,
    private jitterFactor = 0.1,
  ) {
    super(maxAttempts, baseDelaySec);
  }
  protected calculateDelayMs(attempt: number): number {
    const base = this.baseDelaySec * 1000 * Math.pow(2, attempt - 1);
    const jitter = base * this.jitterFactor * Math.random();
    return base + jitter;
  }
}
