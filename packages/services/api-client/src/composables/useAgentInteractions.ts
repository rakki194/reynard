/**
 * ECS Agent interactions and communication composable for Reynard API client
 */

import type { ReynardApiClient } from "../client";
import type { InteractionRequest, ChatRequest, InteractionResponse } from "../types/ecs";
import { createFetchComposable } from "../utils/fetchUtils";

export function useAgentInteractions(client: ReynardApiClient) {
  const { loading, error, fetchWithErrorHandling } = createFetchComposable();

  const initiateInteraction = async (
    agent_id: string,
    request: InteractionRequest
  ): Promise<InteractionResponse> => {
    return fetchWithErrorHandling<InteractionResponse>(
      `${client.config.basePath}/agents/${agent_id}/interact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );
  };

  const sendChatMessage = async (agent_id: string, request: ChatRequest): Promise<unknown> => {
    return fetchWithErrorHandling<unknown>(
      `${client.config.basePath}/agents/${agent_id}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );
  };

  return {
    loading,
    error,
    initiateInteraction,
    sendChatMessage,
  };
}
