import { createSignal } from "solid-js";
import type { AgentEntity } from "../types";
import { MCPServer } from "./mcpServer";
import { generateMockAgent } from "./agentGenerator";

export function useECSAgentTracker() {
  const [agents, setAgents] = createSignal<AgentEntity[]>([]);
  const [isConnected, setIsConnected] = createSignal(true);
  const [isLoading, setIsLoading] = createSignal(false);

  const mcpServer = new MCPServer();

  // Initialize with some mock agents
  const initializeAgents = () => {
    const mockAgents = [
      generateMockAgent("agent-1", "fox", "foundation"),
      generateMockAgent("agent-2", "wolf", "exo"),
      generateMockAgent("agent-3", "otter", "hybrid"),
      generateMockAgent("agent-4", "eagle", "mythological"),
      generateMockAgent("agent-5", "lion", "scientific"),
    ];
    setAgents(mockAgents);
  };

  // Initialize on first load
  if (agents().length === 0) {
    initializeAgents();
  }

  const refreshAgents = async () => {
    try {
      setIsLoading(true);
      await mcpServer.callMCPTool("get_ecs_agent_status");
      // Simulate some movement
      setAgents(prev =>
        prev.map(agent => ({
          ...agent,
          position: {
            x: Math.max(50, Math.min(850, agent.position.x + (Math.random() - 0.5) * 20)),
            y: Math.max(50, Math.min(650, agent.position.y + (Math.random() - 0.5) * 20)),
          },
        }))
      );
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to refresh agents:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (spirit: string, style: string) => {
    try {
      setIsLoading(true);
      await mcpServer.callMCPTool("create_ecs_agent", { spirit, style });

      // Add new agent to the list
      const newAgent = generateMockAgent(`agent-${Date.now()}`, spirit, style);
      setAgents(prev => [...prev, newAgent]);
    } catch (error) {
      console.error("Failed to create agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOffspring = async (parent1Id: string, parent2Id: string) => {
    try {
      setIsLoading(true);
      await mcpServer.callMCPTool("create_ecs_offspring", {
        parent1_id: parent1Id,
        parent2_id: parent2Id,
      });

      // Add new offspring to the list
      const parent1 = agents().find(a => a.id === parent1Id);
      const parent2 = agents().find(a => a.id === parent2Id);
      if (parent1 && parent2) {
        const offspring = generateMockAgent(`offspring-${Date.now()}`, parent1.spirit, parent1.style);
        offspring.lineage.parents = [parent1Id, parent2Id];
        setAgents(prev => [...prev, offspring]);
      }
    } catch (error) {
      console.error("Failed to create offspring:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSimulation = async (deltaTime: number = 1.0) => {
    try {
      await mcpServer.callMCPTool("update_ecs_world", { delta_time: deltaTime });
    } catch (error) {
      console.error("Failed to update simulation:", error);
    }
  };

  const accelerateTime = async (factor: number) => {
    try {
      await mcpServer.callMCPTool("accelerate_time", { factor });
    } catch (error) {
      console.error("Failed to accelerate time:", error);
    }
  };

  const enableAutomaticReproduction = async (enabled: boolean) => {
    try {
      await mcpServer.callMCPTool("enable_automatic_reproduction", { enabled });
    } catch (error) {
      console.error("Failed to toggle reproduction:", error);
    }
  };

  const getSimulationStatus = async () => {
    try {
      return await mcpServer.callMCPTool("get_simulation_status");
    } catch (error) {
      console.error("Failed to get simulation status:", error);
      return null;
    }
  };

  return {
    agents,
    isConnected,
    isLoading,
    refreshAgents,
    createAgent,
    createOffspring,
    updateSimulation,
    accelerateTime,
    enableAutomaticReproduction,
    getSimulationStatus,
  };
}
