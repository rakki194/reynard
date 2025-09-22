/**
 * ECS World simulation composable for Reynard API client
 * Orchestrates specialized ECS composables for modular functionality
 */

import { createSignal } from "solid-js";
import type { ReynardApiClient } from "../client";
import { useWorldManagement } from "./useWorldManagement";
import { useAgentManagement } from "./useAgentManagement";
import { useAgentMovement } from "./useAgentMovement";
import { useAgentProximity } from "./useAgentProximity";
import { useAgentInteractions } from "./useAgentInteractions";
import { useNamingSystem } from "./useNamingSystem";

// Re-export types for backward compatibility
export type {
  ECSAgentCreateRequest,
  ECSAgentResponse,
  ECSWorldStatusResponse,
  PositionResponse,
  MoveRequest,
  MoveTowardsRequest,
  InteractionRequest,
  ChatRequest,
  NearbyAgentResponse,
  InteractionResponse,
  DistanceResponse,
  NearbyAgentsResponse,
} from "../types/ecs";

export function useECS(client: ReynardApiClient) {
  const [_loading, _setLoading] = createSignal(false);
  const [_error, _setError] = createSignal<string | null>(null);

  // Initialize specialized composables
  const worldManagement = useWorldManagement(client);
  const agentManagement = useAgentManagement(client);
  const agentMovement = useAgentMovement(client);
  const agentProximity = useAgentProximity(client);
  const agentInteractions = useAgentInteractions(client);
  const namingSystem = useNamingSystem(client);

  // Combine loading states
  const combinedLoading = () => 
    _loading() || 
    worldManagement.loading() || 
    agentManagement.loading() || 
    agentMovement.loading() || 
    agentProximity.loading() || 
    agentInteractions.loading() || 
    namingSystem.loading();

  // Combine error states
  const combinedError = () => 
    _error() || 
    worldManagement.error() || 
    agentManagement.error() || 
    agentMovement.error() || 
    agentProximity.error() || 
    agentInteractions.error() || 
    namingSystem.error();

  return {
    loading: combinedLoading,
    error: combinedError,
    // World Management
    getWorldStatus: worldManagement.getWorldStatus,
    // Agent Management
    getAgents: agentManagement.getAgents,
    createAgent: agentManagement.createAgent,
    // Position and Movement
    getAgentPosition: agentMovement.getAgentPosition,
    moveAgent: agentMovement.moveAgent,
    moveAgentTowards: agentMovement.moveAgentTowards,
    // Proximity
    getAgentDistance: agentProximity.getAgentDistance,
    getNearbyAgents: agentProximity.getNearbyAgents,
    // Interactions and Communication
    initiateInteraction: agentInteractions.initiateInteraction,
    sendChatMessage: agentInteractions.sendChatMessage,
    // Naming System
    getAnimalSpirits: namingSystem.getAnimalSpirits,
    getNamingConfig: namingSystem.getNamingConfig,
  };
}
