/**
 * HTTP Client Implementation
 *
 * Main HTTP client class with middleware support, retry logic, circuit breaker,
 * and comprehensive error handling. This is the core of the Reynard HTTP system.
 */
import { BaseConnection } from "../base";
import { ConnectionState, } from "../types";
import { HTTP_PRESETS, } from "./types";
// ============================================================================
// HTTP Client Implementation
// ============================================================================
export class HTTPClient {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseHeaders", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "middleware", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "circuitBreakerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "closed"
        });
        Object.defineProperty(this, "circuitBreakerFailures", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "circuitBreakerLastFailure", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        // Merge with default preset
        const preset = HTTP_PRESETS[config.preset || "default"];
        this.config = {
            baseUrl: config.baseUrl,
            timeout: config.timeout ?? preset.config.timeout ?? 30000,
            retries: config.retries ?? preset.config.retries ?? 3,
            apiKey: config.apiKey ?? "",
            headers: config.headers ?? {},
            authToken: config.authToken ?? "",
            enableRetry: config.enableRetry ?? preset.config.enableRetry ?? true,
            enableCircuitBreaker: config.enableCircuitBreaker ??
                preset.config.enableCircuitBreaker ??
                true,
            enableMetrics: config.enableMetrics ?? preset.config.enableMetrics ?? true,
            middleware: config.middleware ?? [],
            preset: config.preset ?? "default",
        };
        this.baseHeaders = {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...this.config.headers,
        };
        // Set up authentication
        if (this.config.apiKey && this.config.apiKey.length > 0) {
            this.baseHeaders.Authorization = `Bearer ${this.config.apiKey}`;
        }
        else if (this.config.authToken && this.config.authToken.length > 0) {
            this.baseHeaders.Authorization = `Bearer ${this.config.authToken}`;
        }
        // Initialize metrics
        this.metrics = {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            circuitBreakerState: this.circuitBreakerState,
        };
        // Add middleware
        this.middleware = [...this.config.middleware];
    }
    /**
     * Make HTTP request with retry logic and middleware
     */
    async request(options) {
        const startTime = Date.now();
        const requestMetrics = {
            startTime,
            retryCount: 0,
        };
        // Check circuit breaker
        if (this.circuitBreakerState === "open") {
            const timeSinceLastFailure = Date.now() - this.circuitBreakerLastFailure;
            if (timeSinceLastFailure < 60000) {
                // 1 minute recovery timeout
                throw this.createError("Circuit breaker is open", options, 503, startTime);
            }
            else {
                this.circuitBreakerState = "half-open";
                this.metrics.circuitBreakerState = this.circuitBreakerState;
            }
        }
        // Apply request middleware
        let processedOptions = options;
        for (const middleware of this.middleware) {
            if (middleware.request) {
                processedOptions = await middleware.request(processedOptions);
            }
        }
        const url = this.buildUrl(processedOptions);
        const headers = { ...this.baseHeaders, ...processedOptions.headers };
        const timeout = processedOptions.timeout ?? this.config.timeout;
        const retries = processedOptions.retries ?? this.config.retries;
        let lastError = null;
        this.metrics.requestCount++;
        this.metrics.lastRequestTime = startTime;
        for (let attempt = 0; attempt <= retries; attempt++) {
            requestMetrics.retryCount = attempt;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                const signal = processedOptions.signal || controller.signal;
                const requestOptions = {
                    method: processedOptions.method,
                    headers,
                    signal,
                };
                // Add body for methods that support it
                if (processedOptions.data &&
                    (processedOptions.method === "POST" ||
                        processedOptions.method === "PUT" ||
                        processedOptions.method === "PATCH")) {
                    if (processedOptions.data instanceof FormData) {
                        requestOptions.body = processedOptions.data;
                        // Remove Content-Type header for FormData (browser will set it with boundary)
                        delete requestOptions.headers["Content-Type"];
                    }
                    else {
                        requestOptions.body = JSON.stringify(processedOptions.data);
                    }
                }
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);
                const responseHeaders = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                let data;
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                    data = await response.json();
                }
                else if (contentType?.includes("text/")) {
                    data = (await response.text());
                }
                else {
                    data = (await response.arrayBuffer());
                }
                const endTime = Date.now();
                const requestTime = endTime - startTime;
                const httpResponse = {
                    data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders,
                    config: processedOptions,
                    requestTime,
                };
                // Update metrics
                this.updateMetrics(true, requestTime);
                // Apply response middleware
                let processedResponse = httpResponse;
                for (const middleware of this.middleware) {
                    if (middleware.response) {
                        processedResponse = (await middleware.response(processedResponse));
                    }
                }
                // Notify middleware of completion
                for (const middleware of this.middleware) {
                    if (middleware.complete) {
                        await middleware.complete(processedOptions, processedResponse);
                    }
                }
                // Reset circuit breaker on success
                if (this.circuitBreakerState === "half-open") {
                    this.circuitBreakerState = "closed";
                    this.circuitBreakerFailures = 0;
                    this.metrics.circuitBreakerState = this.circuitBreakerState;
                }
                return processedResponse;
            }
            catch (error) {
                // timeoutId is cleared in the try block
                const endTime = Date.now();
                const requestTime = endTime - startTime;
                const httpError = this.createError(error instanceof Error ? error.message : "Unknown error", processedOptions, error instanceof Error && "status" in error
                    ? error.status
                    : 0, startTime, requestTime, attempt);
                // Apply error middleware
                let processedError = httpError;
                for (const middleware of this.middleware) {
                    if (middleware.error) {
                        processedError = await middleware.error(processedError);
                    }
                }
                lastError = processedError;
                // Check if we should retry
                if (attempt < retries && this.shouldRetry(processedError)) {
                    const delay = this.calculateRetryDelay(attempt);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
                // Update circuit breaker on failure
                this.updateCircuitBreaker();
                // Update metrics
                this.updateMetrics(false, requestTime);
                // Notify middleware of completion
                for (const middleware of this.middleware) {
                    if (middleware.complete) {
                        await middleware.complete(processedOptions, undefined, processedError);
                    }
                }
                throw processedError;
            }
        }
        throw lastError;
    }
    // ============================================================================
    // Convenience Methods
    // ============================================================================
    async get(endpoint, options = {}) {
        return this.request({ ...options, method: "GET", endpoint });
    }
    async post(endpoint, data, options = {}) {
        return this.request({ ...options, method: "POST", endpoint, data });
    }
    async put(endpoint, data, options = {}) {
        return this.request({ ...options, method: "PUT", endpoint, data });
    }
    async patch(endpoint, data, options = {}) {
        return this.request({ ...options, method: "PATCH", endpoint, data });
    }
    async delete(endpoint, options = {}) {
        return this.request({ ...options, method: "DELETE", endpoint });
    }
    // ============================================================================
    // Middleware Management
    // ============================================================================
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    removeMiddleware(middleware) {
        const index = this.middleware.indexOf(middleware);
        if (index > -1) {
            this.middleware.splice(index, 1);
        }
    }
    clearMiddleware() {
        this.middleware = [];
    }
    // ============================================================================
    // Configuration Management
    // ============================================================================
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        // Update headers if auth changed
        if (newConfig.apiKey !== undefined || newConfig.authToken !== undefined) {
            if (this.config.apiKey && this.config.apiKey.length > 0) {
                this.baseHeaders.Authorization = `Bearer ${this.config.apiKey}`;
            }
            else if (this.config.authToken && this.config.authToken.length > 0) {
                this.baseHeaders.Authorization = `Bearer ${this.config.authToken}`;
            }
            else {
                delete this.baseHeaders.Authorization;
            }
        }
    }
    // ============================================================================
    // Metrics and Monitoring
    // ============================================================================
    getMetrics() {
        return { ...this.metrics };
    }
    resetMetrics() {
        this.metrics = {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            circuitBreakerState: this.circuitBreakerState,
        };
    }
    // ============================================================================
    // Private Helper Methods
    // ============================================================================
    buildUrl(options) {
        const url = new URL(options.endpoint, this.config.baseUrl);
        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }
        return url.toString();
    }
    createError(message, config, status = 0, startTime, requestTime, retryCount = 0) {
        const error = new Error(message);
        error.status = status;
        error.config = config;
        error.requestTime = requestTime;
        error.retryCount = retryCount;
        return error;
    }
    shouldRetry(error) {
        if (!this.config.enableRetry)
            return false;
        // Retry on network errors or 5xx status codes
        return (error.status === 0 || // Network error
            (error.status !== undefined &&
                error.status >= 500 &&
                error.status < 600) || // Server errors
            error.status === 429 // Rate limiting
        );
    }
    calculateRetryDelay(attempt) {
        // Exponential backoff with jitter
        const baseDelay = 1000; // 1 second
        const maxDelay = 30000; // 30 seconds
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 0.1 * delay; // 10% jitter
        return delay + jitter;
    }
    updateMetrics(success, requestTime) {
        if (success) {
            this.metrics.successCount++;
        }
        else {
            this.metrics.errorCount++;
        }
        // Update average response time
        const totalRequests = this.metrics.successCount + this.metrics.errorCount;
        this.metrics.averageResponseTime =
            (this.metrics.averageResponseTime * (totalRequests - 1) + requestTime) /
                totalRequests;
    }
    updateCircuitBreaker() {
        if (!this.config.enableCircuitBreaker)
            return;
        this.circuitBreakerFailures++;
        if (this.circuitBreakerFailures >= 5) {
            // 5 failures threshold
            this.circuitBreakerState = "open";
            this.circuitBreakerLastFailure = Date.now();
            this.metrics.circuitBreakerState = this.circuitBreakerState;
        }
    }
}
// ============================================================================
// HTTP Connection Implementation
// ============================================================================
export class HTTPConnection extends BaseConnection {
    constructor(config) {
        super(config);
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "controller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = new HTTPClient({
            baseUrl: config.url || "",
            timeout: config.timeout,
            enableRetry: true,
            enableCircuitBreaker: true,
            enableMetrics: true,
        });
    }
    async connect() {
        // HTTP connections are stateless, so this is a no-op
        this.state = ConnectionState.CONNECTED;
        return true;
    }
    async disconnect() {
        if (this.controller) {
            this.controller.abort();
        }
        this.state = ConnectionState.DISCONNECTED;
        return true;
    }
    async isConnected() {
        return this.state === ConnectionState.CONNECTED;
    }
    async healthCheck() {
        try {
            const response = await this.client.get("/health", { timeout: 5000 });
            return {
                connectionId: this.connectionId,
                timestamp: Date.now(),
                isHealthy: response.status < 400,
                responseTime: response.requestTime,
                errorMessage: response.status >= 400 ? response.statusText : undefined,
            };
        }
        catch (error) {
            return {
                connectionId: this.connectionId,
                timestamp: Date.now(),
                isHealthy: false,
                responseTime: 0,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async sendImpl(data) {
        if (!this.config.url)
            return false;
        try {
            this.controller = new AbortController();
            const response = await this.client.post("/", data, {
                signal: this.controller.signal,
                timeout: this.config.timeout,
            });
            return response.status < 500;
        }
        catch (error) {
            this.handleError?.(error, "send");
            return false;
        }
    }
    async receiveImpl() {
        if (!this.config.url)
            return null;
        try {
            this.controller = new AbortController();
            const response = await this.client.get("/", {
                signal: this.controller.signal,
                timeout: this.config.timeout,
            });
            return response.data;
        }
        catch (error) {
            this.handleError?.(error, "receive");
            return null;
        }
    }
}
