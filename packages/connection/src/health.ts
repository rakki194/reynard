import { HealthCheckResult } from "./types";

export class HealthChecker {
  private intervalSec = 30;
  private timeoutSec = 5;
  private task?: number;
  private checks = new Map<string, () => Promise<void>>();

  async start() {
    if (this.task) return;
    this.task = setInterval(() => {
      this.run().catch(() => {});
    }, this.intervalSec * 1000) as unknown as number;
  }

  async stop() {
    if (this.task) clearInterval(this.task);
    this.task = undefined;
  }

  add(id: string, fn: () => Promise<void>) {
    this.checks.set(id, fn);
  }

  remove(id: string) {
    this.checks.delete(id);
  }

  private async run() {
    for (const [, fn] of this.checks) {
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        this.timeoutSec * 1000,
      );
      try {
        await fn();
      } catch {
        // ignore
      } finally {
        clearTimeout(timer);
      }
    }
  }

  static result(
    connectionId: string,
    isHealthy: boolean,
    responseTime: number,
    errorMessage?: string,
    details?: Record<string, unknown>,
  ): HealthCheckResult {
    return {
      connectionId,
      timestamp: Date.now(),
      isHealthy,
      responseTime,
      errorMessage,
      details,
    };
  }
}
