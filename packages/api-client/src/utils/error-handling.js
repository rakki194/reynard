/**
 * Error handling utilities for API client
 */
export class ReynardApiError extends Error {
    constructor(status, body, message) {
        super(message || `API Error ${status}`);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ReynardApiError";
        this.status = status;
        this.body = body;
    }
}
export function handleApiError(error) {
    if (error instanceof ReynardApiError) {
        return error;
    }
    if (error.response) {
        // Axios-like error
        return new ReynardApiError(error.response.status, error.response.data, error.message);
    }
    if (error.status) {
        // Fetch-like error
        return new ReynardApiError(error.status, error.body || error.message, error.message);
    }
    // Generic error
    return new ReynardApiError(0, null, error.message || "Unknown error");
}
