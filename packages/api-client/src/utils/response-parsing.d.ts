/**
 * Response parsing utilities for API client
 */
import type { ApiResponse } from "../types.js";
export declare function parseApiResponse<T>(response: Response, data: T): ApiResponse<T>;
export declare function parseApiError(response: Response, error: any): ApiResponse<null>;
