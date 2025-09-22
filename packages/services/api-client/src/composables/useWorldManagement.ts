/**
 * ECS World management composable for Reynard API client
 */

import type { ReynardApiClient } from "../client";
import type { ECSWorldStatusResponse } from "../types/ecs";
import { createFetchComposable } from "../utils/fetchUtils";

export function useWorldManagement(client: ReynardApiClient) {
  const { loading, error, fetchWithErrorHandling } = createFetchComposable();

  const getWorldStatus = async (): Promise<ECSWorldStatusResponse> => {
    return fetchWithErrorHandling<ECSWorldStatusResponse>(`${client.config.basePath}/status`);
  };

  return {
    loading,
    error,
    getWorldStatus,
  };
}
