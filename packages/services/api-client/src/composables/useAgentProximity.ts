/**
 * ECS Agent proximity composable for Reynard API client
 */

import type { ReynardApiClient } from "../client";
import type { DistanceResponse, NearbyAgentsResponse } from "../types/ecs";
import { createFetchComposable } from "../utils/fetchUtils";

export function useAgentProximity(client: ReynardApiClient) {
  const { loading, error, fetchWithErrorHandling } = createFetchComposable();

  const getAgentDistance = async (agent1_id: string, agent2_id: string): Promise<DistanceResponse> => {
    return fetchWithErrorHandling<DistanceResponse>(
      `${client.config.basePath}/agents/${agent1_id}/distance/${agent2_id}`
    );
  };

  const getNearbyAgents = async (agent_id: string, radius: number = 100.0): Promise<NearbyAgentsResponse> => {
    return fetchWithErrorHandling<NearbyAgentsResponse>(
      `${client.config.basePath}/agents/${agent_id}/nearby?radius=${radius}`
    );
  };

  return {
    loading,
    error,
    getAgentDistance,
    getNearbyAgents,
  };
}
