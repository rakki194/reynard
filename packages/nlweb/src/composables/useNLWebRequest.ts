/**
 * NLWeb Request Utilities
 *
 * Request utilities for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";

/**
 * Make HTTP request with timeout
 */
export async function makeNLWebRequest<T>(
  endpoint: string,
  baseUrl: string,
  requestTimeout: number,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Handle API error
 */
export function handleAPIError(
  state: NLWebState,
  error: unknown,
  defaultMessage: string,
): void {
  state.setError(
    error instanceof Error ? error.message : defaultMessage,
  );
}
