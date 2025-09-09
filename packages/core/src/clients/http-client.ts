/**
 * Generic HTTP Client for Reynard Framework
 *
 * A reusable HTTP client with retry logic, error handling, and extensibility.
 * This provides the foundation for all API clients in the Reynard ecosystem.
 */

export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface UploadOptions {
  endpoint: string;
  formData: FormData;
  headers?: Record<string, string>;
}

export class HttpClient {
  private config: Required<Omit<HttpClientConfig, "apiKey" | "headers">> &
    Pick<HttpClientConfig, "apiKey" | "headers">;
  private baseHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      headers: {},
      ...config,
    };

    this.baseHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.config.headers,
    };

    if (this.config.apiKey) {
      this.baseHeaders["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
  }

  /**
   * Make HTTP request with retry logic and exponential backoff
   */
  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const url = `${this.config.baseUrl}${options.endpoint}`;
    const headers = { ...this.baseHeaders, ...options.headers };
    const timeout = options.timeout ?? this.config.timeout;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestOptions: RequestInit = {
          method: options.method,
          headers,
          signal: controller.signal,
        };

        if (
          options.data &&
          (options.method === "POST" ||
            options.method === "PUT" ||
            options.method === "PATCH")
        ) {
          requestOptions.body = JSON.stringify(options.data);
        }

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Request failed after all retries");
  }

  /**
   * Upload file with multipart form data
   */
  async upload<T = unknown>(options: UploadOptions): Promise<T> {
    const url = `${this.config.baseUrl}${options.endpoint}`;
    const headers = {
      Accept: "application/json",
      ...(this.config.apiKey
        ? { Authorization: `Bearer ${this.config.apiKey}` }
        : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: options.formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get the current configuration
   */
  getConfig(): HttpClientConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...updates };

    // Update base headers if needed
    if (updates.apiKey !== undefined) {
      if (updates.apiKey) {
        this.baseHeaders["Authorization"] = `Bearer ${updates.apiKey}`;
      } else {
        delete this.baseHeaders["Authorization"];
      }
    }

    if (updates.headers) {
      this.baseHeaders = { ...this.baseHeaders, ...updates.headers };
    }
  }
}
