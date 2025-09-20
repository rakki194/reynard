import { BaseConnection } from "./base";
import { ConnectionConfig, ConnectionHealth, HealthCheckResult } from "./types";

/**
 * HTTP Client with request handling
 */
export interface HTTPClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
  authToken?: string;
  enableRetry?: boolean;
  enableCircuitBreaker?: boolean;
  enableMetrics?: boolean;
}

export interface HTTPRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

export interface HTTPResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HTTPRequestOptions;
}

export interface HTTPError extends Error {
  status?: number;
  statusText?: string;
  response?: HTTPResponse;
  config: HTTPRequestOptions;
}

export class HTTPClient {
  private config: Required<HTTPClientConfig>;
  private baseHeaders: Record<string, string>;
  private requestCount = 0;
  private errorCount = 0;

  constructor(config: HTTPClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 3,
      apiKey: config.apiKey ?? "",
      headers: config.headers ?? {},
      authToken: config.authToken ?? "",
      enableRetry: config.enableRetry ?? true,
      enableCircuitBreaker: config.enableCircuitBreaker ?? true,
      enableMetrics: config.enableMetrics ?? true,
    };

    this.baseHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...this.config.headers,
    };

    if (this.config.apiKey && this.config.apiKey.length > 0) {
      this.baseHeaders.Authorization = `Bearer ${this.config.apiKey}`;
    } else if (this.config.authToken && this.config.authToken.length > 0) {
      this.baseHeaders.Authorization = `Bearer ${this.config.authToken}`;
    }
  }

  /**
   * Make HTTP request with retry logic and exponential backoff
   */
  async request<T = unknown>(options: HTTPRequestOptions): Promise<HTTPResponse<T>> {
    const url = `${this.config.baseUrl}${options.endpoint}`;
    const headers = { ...this.baseHeaders, ...options.headers };
    const timeout = options.timeout ?? this.config.timeout;
    const retries = options.retries ?? this.config.retries;
    let lastError: HTTPError | null = null;

    this.requestCount++;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Use provided signal or create new one
        const signal = options.signal || controller.signal;

        const requestOptions: RequestInit = {
          method: options.method,
          headers,
          signal,
        };

        if (options.data && (options.method === "POST" || options.method === "PUT" || options.method === "PATCH")) {
          requestOptions.body = JSON.stringify(options.data);
        }

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let data: T;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as HTTPError;
          error.status = response.status;
          error.statusText = response.statusText;
          error.response = {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            config: options,
          };
          error.config = options;
          throw error;
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          config: options,
        };
      } catch (error) {
        lastError = error instanceof Error ? (error as HTTPError) : (new Error(String(error)) as HTTPError);

        lastError.config = options;

        if (attempt < retries && this.config.enableRetry) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.errorCount++;
    throw lastError || new Error("Request failed after all retries");
  }

  /**
   * Convenience methods for common HTTP operations
   */
  async get<T = unknown>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>> {
    return this.request<T>({ method: "GET", endpoint, ...options });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: Partial<HTTPRequestOptions>
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ method: "POST", endpoint, data, ...options });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: Partial<HTTPRequestOptions>
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ method: "PUT", endpoint, data, ...options });
  }

  async delete<T = unknown>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>> {
    return this.request<T>({ method: "DELETE", endpoint, ...options });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: Partial<HTTPRequestOptions>
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ method: "PATCH", endpoint, data, ...options });
  }

  /**
   * Upload file with multipart form data
   */
  async upload<T = unknown>(
    endpoint: string,
    file: File,
    options?: Partial<HTTPRequestOptions>
  ): Promise<HTTPResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    const headers = { ...this.baseHeaders };
    delete headers["Content-Type"]; // Let browser set multipart boundary

    return this.request<T>({
      method: "POST",
      endpoint,
      data: formData,
      headers,
      ...options,
    });
  }

  /**
   * Get client metrics
   */
  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HTTPClientConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.apiKey && newConfig.apiKey.length > 0) {
      this.baseHeaders.Authorization = `Bearer ${newConfig.apiKey}`;
    } else if (newConfig.authToken && newConfig.authToken.length > 0) {
      this.baseHeaders.Authorization = `Bearer ${newConfig.authToken}`;
    }
  }
}

export class HTTPConnection extends BaseConnection {
  private controller?: AbortController;
  private httpClient?: HTTPClient;

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
      const method = typeof data === "object" && data !== null ? "POST" : "POST";

      // Ensure HTTPS in production
      if (process.env.NODE_ENV === "production" && !this["config"].url.startsWith("https:")) {
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
