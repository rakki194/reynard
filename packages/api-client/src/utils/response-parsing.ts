/**
 * Response parsing utilities for API client
 */

import type { ApiResponse } from "../types.js";

export function parseApiResponse<T>(response: Response, data: T): ApiResponse<T> {
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

export function parseApiError(response: Response, error: any): ApiResponse<null> {
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
