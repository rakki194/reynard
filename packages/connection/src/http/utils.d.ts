/**
 * HTTP Utility Functions
 *
 * Utility functions for common HTTP operations, URL building, header management,
 * and response processing.
 */
import { HTTPRequestOptions, HTTPResponse, HTTPError } from "./types";
/**
 * Build a complete URL from base URL and endpoint
 */
export declare function buildUrl(baseUrl: string, endpoint: string, params?: Record<string, string | number | boolean>): string;
/**
 * Parse query parameters from a URL
 */
export declare function parseQueryParams(url: string): Record<string, string>;
/**
 * Add query parameters to a URL
 */
export declare function addQueryParams(url: string, params: Record<string, string | number | boolean>): string;
/**
 * Merge headers with priority (later headers override earlier ones)
 */
export declare function mergeHeaders(...headerObjects: Array<Record<string, string> | undefined>): Record<string, string>;
/**
 * Normalize header names (convert to lowercase)
 */
export declare function normalizeHeaders(headers: Record<string, string>): Record<string, string>;
/**
 * Check if headers contain a specific header
 */
export declare function hasHeader(headers: Record<string, string>, headerName: string): boolean;
/**
 * Get header value (case-insensitive)
 */
export declare function getHeader(headers: Record<string, string>, headerName: string): string | undefined;
/**
 * Create a request options object with defaults
 */
export declare function createRequestOptions(method: HTTPRequestOptions["method"], endpoint: string, options?: Partial<HTTPRequestOptions>): HTTPRequestOptions;
/**
 * Clone request options
 */
export declare function cloneRequestOptions(options: HTTPRequestOptions): HTTPRequestOptions;
/**
 * Validate request options
 */
export declare function validateRequestOptions(options: HTTPRequestOptions): string[];
/**
 * Check if response is successful
 */
export declare function isSuccessResponse(response: HTTPResponse): boolean;
/**
 * Check if response is a client error
 */
export declare function isClientError(response: HTTPResponse): boolean;
/**
 * Check if response is a server error
 */
export declare function isServerError(response: HTTPResponse): boolean;
/**
 * Check if response indicates a redirect
 */
export declare function isRedirectResponse(response: HTTPResponse): boolean;
/**
 * Get response content type
 */
export declare function getContentType(response: HTTPResponse): string | null;
/**
 * Check if response is JSON
 */
export declare function isJsonResponse(response: HTTPResponse): boolean;
/**
 * Check if response is text
 */
export declare function isTextResponse(response: HTTPResponse): boolean;
/**
 * Check if response is binary
 */
export declare function isBinaryResponse(response: HTTPResponse): boolean;
/**
 * Create an HTTP error from a response
 */
export declare function createErrorFromResponse(response: HTTPResponse, message?: string): HTTPError;
/**
 * Check if error is a network error
 */
export declare function isNetworkError(error: HTTPError): boolean;
/**
 * Check if error is a timeout error
 */
export declare function isTimeoutError(error: HTTPError): boolean;
/**
 * Check if error is retryable
 */
export declare function isRetryableError(error: HTTPError): boolean;
/**
 * Get error message with context
 */
export declare function getErrorMessage(error: HTTPError): string;
/**
 * Serialize data for HTTP request
 */
export declare function serializeData(data: unknown): string | FormData;
/**
 * Parse response data based on content type
 */
export declare function parseResponseData<T>(response: Response): Promise<T>;
/**
 * Convert FormData to object
 */
export declare function formDataToObject(formData: FormData): Record<string, string>;
/**
 * Convert object to FormData
 */
export declare function objectToFormData(obj: Record<string, string | File | Blob>): FormData;
/**
 * Measure request performance
 */
export declare function measureRequest<T>(requestFn: () => Promise<T>): Promise<{
    result: T;
    duration: number;
}>;
/**
 * Create a performance timer
 */
export declare function createTimer(): {
    start: () => void;
    stop: () => number;
};
/**
 * Validate URL
 */
export declare function isValidUrl(url: string): boolean;
/**
 * Validate HTTP method
 */
export declare function isValidHttpMethod(method: string): method is HTTPRequestOptions["method"];
/**
 * Validate status code
 */
export declare function isValidStatusCode(status: number): boolean;
/**
 * Format bytes to human readable string
 */
export declare function formatBytes(bytes: number): string;
/**
 * Format duration to human readable string
 */
export declare function formatDuration(milliseconds: number): string;
