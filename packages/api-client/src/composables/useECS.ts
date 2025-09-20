/**
 * ECS World simulation composable for Reynard API client
 */

import { createSignal, createEffect } from "solid-js";
import type { ReynardApiClient } from "../client";

export interface ECSAgentCreateRequest {
  agent_id: string;
  spirit?: string;
  style?: string;
  name?: string;
}

export interface ECSAgentResponse {
  agent_id: string;
  name: string;
  spirit: string;
  style: string;
  active: boolean;
}

export interface ECSWorldStatusResponse {
  status: string;
  entity_count?: number;
  system_count?: number;
  agent_count?: number;
  mature_agents?: number;
}

export interface PositionResponse {
  agent_id: string;
  x: number;
  y: number;
  target_x: number;
  target_y: number;
  velocity_x: number;
  velocity_y: number;
  movement_speed: number;
}

export interface MoveRequest {
  x: number;
  y: number;
}

export interface MoveTowardsRequest {
  target_agent_id: string;
  distance?: number;
}

export interface InteractionRequest {
  agent2_id: string;
  interaction_type?: string;
}

export interface ChatRequest {
  receiver_id: string;
  message: string;
  interaction_type?: string;
}

export interface NearbyAgentResponse {
  agent_id: string;
  name: string;
  spirit: string;
  x: number;
  y: number;
  distance: number;
}

export function useECS(client: ReynardApiClient) {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // World Management
  const getWorldStatus = async (): Promise<ECSWorldStatusResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/status`);

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

  // Agent Management
  const getAgents = async (): Promise<ECSAgentResponse[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents`);

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

  const createAgent = async (request: ECSAgentCreateRequest): Promise<ECSAgentResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

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

  // Position and Movement
  const getAgentPosition = async (agent_id: string): Promise<PositionResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents/${agent_id}/position`);

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

  const moveAgent = async (agent_id: string, request: MoveRequest): Promise<PositionResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents/${agent_id}/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

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

  const moveAgentTowards = async (agent_id: string, request: MoveTowardsRequest): Promise<PositionResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents/${agent_id}/move_towards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

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

  const getAgentDistance = async (agent1_id: string, agent2_id: string): Promise<{
    agent1_id: string;
    agent2_id: string;
    distance: number;
    position1: { x: number; y: number };
    position2: { x: number; y: number };
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents/${agent1_id}/distance/${agent2_id}`);

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

  const getNearbyAgents = async (agent_id: string, radius: number = 100.0): Promise<{
    nearby_agents: NearbyAgentResponse[];
    radius: number;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents/${agent_id}/nearby?radius=${radius}`);

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

  // Interactions and Communication
  const initiateInteraction = async (agent_id: string, request: InteractionRequest): Promise<{
    success: boolean;
    message: string;
    interaction_type?: string;
    agent1_energy?: number;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents/${agent_id}/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

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

  const sendChatMessage = async (agent_id: string, request: ChatRequest): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/agents/${agent_id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

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

  // Naming System
  const getAnimalSpirits = async (): Promise<Record<string, any>> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/naming/animal-spirits`);

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

  const getNamingConfig = async (): Promise<Record<string, any>> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/naming/config`);

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
    // World Management
    getWorldStatus,
    // Agent Management
    getAgents,
    createAgent,
    // Position and Movement
    getAgentPosition,
    moveAgent,
    moveAgentTowards,
    getAgentDistance,
    getNearbyAgents,
    // Interactions and Communication
    initiateInteraction,
    sendChatMessage,
    // Naming System
    getAnimalSpirits,
    getNamingConfig,
  };
}
