import { BaseConnection } from "./base";
import { ConnectionConfig, ConnectionHealth, HealthCheckResult } from "./types";

export class HTTPConnection extends BaseConnection {
  private controller?: AbortController;

  constructor(config: ConnectionConfig) {
    super(config);
    if (!config.url) throw new Error("HTTP connection requires a URL");
  }

  async connect(): Promise<boolean> {
    if (await this.isConnected()) return true;
    // For fetch, no persistent connection; treat as ready
    this.setState((this as any).state?.CONNECTED ?? ({} as any)); // no-op placeholder; state set via protected method only in base
    // We cannot access protected, so mark via health check behavior
    this["isActive"] = true;
    return true;
  }

  async disconnect(): Promise<boolean> {
    // Abort any inflight
    this.controller?.abort();
    this["isActive"] = false;
    return true;
  }

  async isConnected(): Promise<boolean> {
    return true; // stateless HTTP
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = performance.now();
    try {
      if (!this["config"].url) throw new Error("No URL");
      const res = await fetch(this["config"].url, { method: "HEAD" });
      const rt = performance.now() - start;
      (this as any).setHealth?.(ConnectionHealth.HEALTHY);
      this["lastHealthCheck"] = Date.now();
      return {
        connectionId: this.connectionId,
        timestamp: Date.now(),
        isHealthy: res.status < 500,
        responseTime: rt,
      };
    } catch (e: any) {
      const rt = performance.now() - start;
      (this as any).setHealth?.(ConnectionHealth.UNHEALTHY);
      this["lastHealthCheck"] = Date.now();
      return {
        connectionId: this.connectionId,
        timestamp: Date.now(),
        isHealthy: false,
        responseTime: rt,
        errorMessage: e?.message,
      };
    }
  }

  protected async sendImpl(data: unknown): Promise<boolean> {
    if (!this["config"].url) return false;
    try {
      this.controller = new AbortController();
      const method =
        typeof data === "object" && data !== null ? "POST" : "POST";

      // Ensure HTTPS in production
      if (
        process.env.NODE_ENV === "production" &&
        !this["config"].url.startsWith("https:")
      ) {
        throw new Error("HTTPS required in production");
      }

      const res = await fetch(this["config"].url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...(this["config"].customHeaders ?? {}),
        },
        body: typeof data === "object" ? JSON.stringify(data) : (data as any),
        signal: this.controller.signal,
        credentials: "same-origin", // Only send credentials to same origin
      });
      return res.status < 500;
    } catch (e) {
      this["handleError"]?.(e, "send");
      return false;
    }
  }

  protected async receiveImpl(): Promise<unknown> {
    if (!this["config"].url) return null;
    try {
      const res = await fetch(this["config"].url, {
        headers: { ...(this["config"].customHeaders ?? {}) },
      });
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { text };
      }
    } catch (e) {
      this["handleError"]?.(e, "receive");
      return null;
    }
  }
}
