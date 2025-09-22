/**
 * ECS Naming system composable for Reynard API client
 */

import type { ReynardApiClient } from "../client";
import { createFetchComposable } from "../utils/fetchUtils";

export function useNamingSystem(client: ReynardApiClient) {
  const { loading, error, fetchWithErrorHandling } = createFetchComposable();

  const getAnimalSpirits = async (): Promise<Record<string, unknown>> => {
    return fetchWithErrorHandling<Record<string, unknown>>(
      `${client.config.basePath}/naming/animal-spirits`
    );
  };

  const getNamingConfig = async (): Promise<Record<string, unknown>> => {
    return fetchWithErrorHandling<Record<string, unknown>>(
      `${client.config.basePath}/naming/config`
    );
  };

  return {
    loading,
    error,
    getAnimalSpirits,
    getNamingConfig,
  };
}
