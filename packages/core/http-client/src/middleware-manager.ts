/**
 * Middleware Manager Implementation
 *
 * Manages HTTP middleware execution for request/response processing,
 * error handling, and completion callbacks.
 */

import { HTTPMiddleware } from "./middleware-types";
import { HTTPRequestOptions, HTTPResponse, HTTPError } from "./types";

export class MiddlewareManager {
  private middleware: HTTPMiddleware[] = [];

  constructor(initialMiddleware: HTTPMiddleware[] = []) {
    this.middleware = [...initialMiddleware];
  }

  /**
   * Add middleware to the chain
   */
  addMiddleware(middleware: HTTPMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Remove middleware from the chain
   */
  removeMiddleware(middleware: HTTPMiddleware): void {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }

  /**
   * Clear all middleware
   */
  clearMiddleware(): void {
    this.middleware = [];
  }

  /**
   * Get all middleware
   */
  getMiddleware(): HTTPMiddleware[] {
    return [...this.middleware];
  }

  /**
   * Apply request middleware
   */
  async processRequest(options: HTTPRequestOptions): Promise<HTTPRequestOptions> {
    let processedOptions = options;

    for (const middleware of this.middleware) {
      if (middleware.request) {
        processedOptions = await middleware.request(processedOptions);
      }
    }

    return processedOptions;
  }

  /**
   * Apply response middleware
   */
  async processResponse<T>(response: HTTPResponse<T>): Promise<HTTPResponse<T>> {
    let processedResponse = response;

    for (const middleware of this.middleware) {
      if (middleware.response) {
        processedResponse = (await middleware.response(processedResponse)) as HTTPResponse<T>;
      }
    }

    return processedResponse;
  }

  /**
   * Apply error middleware
   */
  async processError(error: HTTPError): Promise<HTTPError> {
    let processedError = error;

    for (const middleware of this.middleware) {
      if (middleware.error) {
        processedError = await middleware.error(processedError);
      }
    }

    return processedError;
  }

  /**
   * Notify middleware of request completion
   */
  async notifyCompletion<T>(options: HTTPRequestOptions, response?: HTTPResponse<T>, error?: HTTPError): Promise<void> {
    for (const middleware of this.middleware) {
      if (middleware.complete) {
        await middleware.complete(options, response, error);
      }
    }
  }
}
