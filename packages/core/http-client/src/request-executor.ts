/**
 * Request Executor Implementation
 *
 * Handles the actual HTTP request execution with proper error handling
 * and response processing.
 */

import { HTTPRequestOptions, HTTPResponse } from "./types";

export class RequestExecutor {
  /**
   * Execute an HTTP request with proper error handling and response processing
   */
  async executeRequest<T>(
    options: HTTPRequestOptions,
    url: string,
    headers: Record<string, string>,
    timeout: number
  ): Promise<HTTPResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const signal = options.signal || controller.signal;

    const requestOptions: RequestInit = {
      method: options.method,
      headers,
      signal,
    };

    // Add body for methods that support it
    if (options.data && (options.method === "POST" || options.method === "PUT" || options.method === "PATCH")) {
      if (options.data instanceof FormData) {
        requestOptions.body = options.data;
        // Remove Content-Type header for FormData (browser will set it with boundary)
        delete (requestOptions.headers as Record<string, string>)["Content-Type"];
      } else {
        requestOptions.body = JSON.stringify(options.data);
      }
    }

    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: T;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = (await response.text()) as T;
    } else {
      data = (await response.arrayBuffer()) as T;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      config: options,
      requestTime: 0, // Will be calculated in the calling method
    };
  }
}
