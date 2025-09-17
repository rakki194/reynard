/**
 * Response parsing utilities for API client
 */
export function parseApiResponse(response, data) {
    return {
        data,
        success: response.ok,
        status: response.status,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: response.headers.get("x-request-id") || undefined,
        },
    };
}
export function parseApiError(response, error) {
    return {
        data: null,
        error: error?.message || `HTTP ${response.status}: ${response.statusText}`,
        success: false,
        status: response.status,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: response.headers.get("x-request-id") || undefined,
        },
    };
}
