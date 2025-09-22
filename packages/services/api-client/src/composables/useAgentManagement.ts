/**
 * ECS Agent management composable for Reynard API client
 */

import type { ReynardApiClient } from "../client";
import type { ECSAgentCreateRequest, ECSAgentResponse } from "../types/ecs";
import { createFetchComposable } from "../utils/fetchUtils";

export function useAgentManagement(client: ReynardApiClient) {
  const { loading, error, fetchWithErrorHandling } = createFetchComposable();

  const getAgents = async (): Promise<ECSAgentResponse[]> => {
    return fetchWithErrorHandling<ECSAgentResponse[]>(`${client.config.basePath}/agents`);
  };

  const createAgent = async (request: ECSAgentCreateRequest): Promise<ECSAgentResponse> => {
    return fetchWithErrorHandling<ECSAgentResponse>(`${client.config.basePath}/agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  };

  return {
    loading,
    error,
    getAgents,
    createAgent,
  };
}
