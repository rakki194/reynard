/**
 * ECS World simulation types for Reynard API client
 */

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

export interface InteractionResponse {
  success: boolean;
  message: string;
  interaction_type?: string;
  agent1_energy?: number;
}

export interface DistanceResponse {
  agent1_id: string;
  agent2_id: string;
  distance: number;
  position1: { x: number; y: number };
  position2: { x: number; y: number };
}

export interface NearbyAgentsResponse {
  nearby_agents: NearbyAgentResponse[];
  radius: number;
}
