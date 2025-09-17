/**
 * Error handling utilities for API client
 */

import type { ApiError } from "../types.js";

export class ReynardApiError extends Error implements ApiError {
  public status: number;
  public body: any;

  constructor(status: number, body: any, message?: string) {
    super(message || `API Error ${status}`);
    this.name = "ReynardApiError";
    this.status = status;
    this.body = body;
  }
}

export function handleApiError(error: any): ReynardApiError {
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
