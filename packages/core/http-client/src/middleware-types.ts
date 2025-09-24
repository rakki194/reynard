/**
 * HTTP Middleware Types
 *
 * Type definitions for HTTP middleware system.
 */

import { HTTPRequestOptions, HTTPResponse, HTTPError } from "./types";

// ============================================================================
// Middleware Types
// ============================================================================

export interface HTTPMiddleware {
  name?: string;
  request?: (options: HTTPRequestOptions) => HTTPRequestOptions | Promise<HTTPRequestOptions>;
  response?: (response: HTTPResponse) => HTTPResponse | Promise<HTTPResponse>;
  error?: (error: HTTPError) => HTTPError | Promise<HTTPError>;
  complete?: (
    options: HTTPRequestOptions,
    response?: HTTPResponse,
    error?: HTTPError
  ) => void | Promise<void>;
}

export interface HTTPMiddlewareStack {
  name: string;
  middleware: HTTPMiddleware[];
  enabled: boolean;
}

export interface HTTPMiddlewareConfig {
  stacks: HTTPMiddlewareStack[];
  global: HTTPMiddleware[];
}

export interface HTTPMiddlewareContext {
  request: HTTPRequestOptions;
  response?: HTTPResponse;
  error?: HTTPError;
  metadata: Record<string, unknown>;
}

export interface HTTPMiddlewareResult {
  success: boolean;
  modified: boolean;
  error?: Error;
  metadata?: Record<string, unknown>;
}

export interface HTTPMiddlewareFactory {
  create(config: Record<string, unknown>): HTTPMiddleware;
  validate(config: Record<string, unknown>): boolean;
  getDefaultConfig(): Record<string, unknown>;
}

export interface HTTPMiddlewareRegistry {
  register(name: string, factory: HTTPMiddlewareFactory): void;
  unregister(name: string): void;
  get(name: string): HTTPMiddlewareFactory | undefined;
  list(): string[];
  create(name: string, config?: Record<string, unknown>): HTTPMiddleware;
}

export interface HTTPMiddlewareExecutor {
  executeRequest(middleware: HTTPMiddleware[], options: HTTPRequestOptions): Promise<HTTPRequestOptions>;
  executeResponse(middleware: HTTPMiddleware[], response: HTTPResponse): Promise<HTTPResponse>;
  executeError(middleware: HTTPMiddleware[], error: HTTPError): Promise<HTTPError>;
  executeComplete(
    middleware: HTTPMiddleware[],
    options: HTTPRequestOptions,
    response?: HTTPResponse,
    error?: HTTPError
  ): Promise<void>;
}

export interface HTTPMiddlewarePipeline {
  add(middleware: HTTPMiddleware): void;
  remove(middleware: HTTPMiddleware): void;
  clear(): void;
  execute(options: HTTPRequestOptions): Promise<HTTPResponse>;
}

export interface HTTPMiddlewareChain {
  next(options: HTTPRequestOptions): Promise<HTTPRequestOptions>;
  nextResponse(response: HTTPResponse): Promise<HTTPResponse>;
  nextError(error: HTTPError): Promise<HTTPError>;
  nextComplete(options: HTTPRequestOptions, response?: HTTPResponse, error?: HTTPError): Promise<void>;
}
