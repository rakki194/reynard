/**
 * ECS Agent movement composable for Reynard API client
 */

import type { ReynardApiClient } from "../client";
import type { PositionResponse, MoveRequest, MoveTowardsRequest } from "../types/ecs";
import { createFetchComposable } from "../utils/fetchUtils";

export function useAgentMovement(client: ReynardApiClient) {
  const { loading, error, fetchWithErrorHandling } = createFetchComposable();

  const getAgentPosition = async (agent_id: string): Promise<PositionResponse> => {
    return fetchWithErrorHandling<PositionResponse>(`${client.config.basePath}/agents/${agent_id}/position`);
  };

  const moveAgent = async (agent_id: string, request: MoveRequest): Promise<PositionResponse> => {
    return fetchWithErrorHandling<PositionResponse>(`${client.config.basePath}/agents/${agent_id}/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  };

  const moveAgentTowards = async (agent_id: string, request: MoveTowardsRequest): Promise<PositionResponse> => {
    return fetchWithErrorHandling<PositionResponse>(`${client.config.basePath}/agents/${agent_id}/move_towards`, {
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
    getAgentPosition,
    moveAgent,
    moveAgentTowards,
  };
}
