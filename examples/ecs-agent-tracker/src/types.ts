export interface AgentEntity {
  id: string;
  name: string;
  spirit: string;
  style: string;
  position: { x: number; y: number };
  age: number;
  maturityAge: number;
  traits: AgentTraits;
  lineage: LineageData;
  isSelected?: boolean;
}

export interface AgentTraits {
  personality: {
    dominance: number;
    independence: number;
    patience: number;
    aggression: number;
    charisma: number;
    creativity: number;
    perfectionism: number;
    adaptability: number;
    playfulness: number;
    intelligence: number;
    loyalty: number;
    curiosity: number;
    courage: number;
    empathy: number;
    determination: number;
    spontaneity: number;
  };
  physical: {
    size: number;
    strength: number;
    agility: number;
    endurance: number;
    appearance: number;
    grace: number;
    speed: number;
    coordination: number;
    stamina: number;
    flexibility: number;
    reflexes: number;
    vitality: number;
  };
  abilities: {
    strategist: number;
    hunter: number;
    teacher: number;
    artist: number;
    healer: number;
    inventor: number;
    explorer: number;
    guardian: number;
    diplomat: number;
    warrior: number;
    scholar: number;
    performer: number;
    builder: number;
    navigator: number;
    communicator: number;
    leader: number;
  };
}

export interface LineageData {
  parents: string[];
  children: string[];
  ancestors: string[];
  descendants: string[];
}

export interface SimulationStatus {
  totalAgents: number;
  matureAgents: number;
  simulationTime: number;
  timeAcceleration: number;
  automaticReproduction: boolean;
}

export interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface CreateAgentParams {
  spirit?: string;
  style?: string;
  name?: string;
}

export interface CreateOffspringParams {
  parent1_id: string;
  parent2_id: string;
  offspring_id?: string;
}

export interface CompatibilityAnalysis {
  compatibility: number;
  analysis: string;
  recommended: boolean;
}

export interface LineageInfo {
  agent: { agent_id: string };
  parents: string[];
  children: string[];
  ancestors: string[];
  descendants: string[];
}
