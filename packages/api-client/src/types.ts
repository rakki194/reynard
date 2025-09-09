/**
 * Common types for the Reynard API client
 */

export interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export type AuthFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success?: boolean;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp?: string;
    requestId?: string;
  };
}