/**
 * HTTP Utility Functions
 *
 * Utility functions for common HTTP operations, URL building, header management,
 * and response processing.
 */
// ============================================================================
// URL Utilities
// ============================================================================
/**
 * Build a complete URL from base URL and endpoint
 */
export function buildUrl(baseUrl, endpoint, params) {
    const url = new URL(endpoint, baseUrl);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, String(value));
        });
    }
    return url.toString();
}
/**
 * Parse query parameters from a URL
 */
export function parseQueryParams(url) {
    const urlObj = new URL(url);
    const params = {};
    urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
/**
 * Add query parameters to a URL
 */
export function addQueryParams(url, params) {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.set(key, String(value));
    });
    return urlObj.toString();
}
// ============================================================================
// Header Utilities
// ============================================================================
/**
 * Merge headers with priority (later headers override earlier ones)
 */
export function mergeHeaders(...headerObjects) {
    const merged = {};
    for (const headers of headerObjects) {
        if (headers) {
            Object.assign(merged, headers);
        }
    }
    return merged;
}
/**
 * Normalize header names (convert to lowercase)
 */
export function normalizeHeaders(headers) {
    const normalized = {};
    Object.entries(headers).forEach(([key, value]) => {
        normalized[key.toLowerCase()] = value;
    });
    return normalized;
}
/**
 * Check if headers contain a specific header
 */
export function hasHeader(headers, headerName) {
    const normalizedName = headerName.toLowerCase();
    return Object.keys(headers).some((key) => key.toLowerCase() === normalizedName);
}
/**
 * Get header value (case-insensitive)
 */
export function getHeader(headers, headerName) {
    const normalizedName = headerName.toLowerCase();
    const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === normalizedName);
    return entry?.[1];
}
// ============================================================================
// Request Utilities
// ============================================================================
/**
 * Create a request options object with defaults
 */
export function createRequestOptions(method, endpoint, options = {}) {
    return {
        method,
        endpoint,
        ...options,
    };
}
/**
 * Clone request options
 */
export function cloneRequestOptions(options) {
    return {
        ...options,
        headers: { ...options.headers },
        params: { ...options.params },
    };
}
/**
 * Validate request options
 */
export function validateRequestOptions(options) {
    const errors = [];
    if (!options.method) {
        errors.push("Method is required");
    }
    if (!options.endpoint) {
        errors.push("Endpoint is required");
    }
    if (options.timeout !== undefined && options.timeout <= 0) {
        errors.push("Timeout must be positive");
    }
    if (options.retries !== undefined && options.retries < 0) {
        errors.push("Retries must be non-negative");
    }
    return errors;
}
// ============================================================================
// Response Utilities
// ============================================================================
/**
 * Check if response is successful
 */
export function isSuccessResponse(response) {
    return response.status >= 200 && response.status < 300;
}
/**
 * Check if response is a client error
 */
export function isClientError(response) {
    return response.status >= 400 && response.status < 500;
}
/**
 * Check if response is a server error
 */
export function isServerError(response) {
    return response.status >= 500 && response.status < 600;
}
/**
 * Check if response indicates a redirect
 */
export function isRedirectResponse(response) {
    return response.status >= 300 && response.status < 400;
}
/**
 * Get response content type
 */
export function getContentType(response) {
    return getHeader(response.headers, "content-type") || null;
}
/**
 * Check if response is JSON
 */
export function isJsonResponse(response) {
    const contentType = getContentType(response);
    return contentType?.includes("application/json") ?? false;
}
/**
 * Check if response is text
 */
export function isTextResponse(response) {
    const contentType = getContentType(response);
    return contentType?.includes("text/") ?? false;
}
/**
 * Check if response is binary
 */
export function isBinaryResponse(response) {
    const contentType = getContentType(response);
    return contentType?.includes("application/octet-stream") ?? false;
}
// ============================================================================
// Error Utilities
// ============================================================================
/**
 * Create an HTTP error from a response
 */
export function createErrorFromResponse(response, message) {
    const error = new Error(message || `HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = response;
    error.config = response.config;
    error.requestTime = response.requestTime;
    return error;
}
/**
 * Check if error is a network error
 */
export function isNetworkError(error) {
    return error.status === 0;
}
/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error) {
    return error.message.includes("timeout") || error.message.includes("aborted");
}
/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    return (isNetworkError(error) ||
        isTimeoutError(error) ||
        (error.status !== undefined && error.status >= 500 && error.status < 600) ||
        error.status === 429);
}
/**
 * Get error message with context
 */
export function getErrorMessage(error) {
    if (isNetworkError(error)) {
        return "Network error: Unable to connect to server";
    }
    if (isTimeoutError(error)) {
        return "Request timeout: Server did not respond in time";
    }
    if (error.status) {
        return `HTTP ${error.status}: ${error.statusText || error.message}`;
    }
    return error.message;
}
// ============================================================================
// Data Utilities
// ============================================================================
/**
 * Serialize data for HTTP request
 */
export function serializeData(data) {
    if (data instanceof FormData) {
        return data;
    }
    if (data instanceof URLSearchParams) {
        return data.toString();
    }
    if (typeof data === "string") {
        return data;
    }
    return JSON.stringify(data);
}
/**
 * Parse response data based on content type
 */
export async function parseResponseData(response) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json();
    }
    if (contentType?.includes("text/")) {
        return response.text();
    }
    if (contentType?.includes("application/octet-stream")) {
        return response.arrayBuffer();
    }
    // Default to text
    return response.text();
}
/**
 * Convert FormData to object
 */
export function formDataToObject(formData) {
    const obj = {};
    formData.forEach((value, key) => {
        if (typeof value === "string") {
            obj[key] = value;
        }
    });
    return obj;
}
/**
 * Convert object to FormData
 */
export function objectToFormData(obj) {
    const formData = new FormData();
    Object.entries(obj).forEach(([key, value]) => {
        formData.append(key, value);
    });
    return formData;
}
// ============================================================================
// Performance Utilities
// ============================================================================
/**
 * Measure request performance
 */
export function measureRequest(requestFn) {
    const startTime = performance.now();
    return requestFn().then((result) => {
        const endTime = performance.now();
        return {
            result,
            duration: endTime - startTime,
        };
    });
}
/**
 * Create a performance timer
 */
export function createTimer() {
    let startTime;
    return {
        start: () => {
            startTime = performance.now();
        },
        stop: () => {
            return performance.now() - startTime;
        },
    };
}
// ============================================================================
// Validation Utilities
// ============================================================================
/**
 * Validate URL
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Validate HTTP method
 */
export function isValidHttpMethod(method) {
    const validMethods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "HEAD",
        "OPTIONS",
    ];
    return validMethods.includes(method.toUpperCase());
}
/**
 * Validate status code
 */
export function isValidStatusCode(status) {
    return status >= 100 && status < 600;
}
// ============================================================================
// String Utilities
// ============================================================================
/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes) {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
/**
 * Format duration to human readable string
 */
export function formatDuration(milliseconds) {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    }
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(2)}s`;
    }
    const minutes = seconds / 60;
    if (minutes < 60) {
        return `${minutes.toFixed(2)}m`;
    }
    const hours = minutes / 60;
    return `${hours.toFixed(2)}h`;
}
