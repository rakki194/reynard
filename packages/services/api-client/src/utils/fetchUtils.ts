/**
 * Shared fetch utilities for ECS API client
 */

import { createSignal } from "solid-js";

export function createFetchComposable() {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const fetchWithErrorHandling = async <T>(url: string, options?: RequestInit): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchWithErrorHandling,
  };
}
