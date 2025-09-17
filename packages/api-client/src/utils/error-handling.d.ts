/**
 * Error handling utilities for API client
 */
import type { ApiError } from "../types.js";
export declare class ReynardApiError extends Error implements ApiError {
    status: number;
    body: any;
    constructor(status: number, body: any, message?: string);
}
export declare function handleApiError(error: any): ReynardApiError;
