import { createSignal } from "solid-js";
import type { AgentEntity, AgentTraits } from "../types";
import { MCPServer } from "./mcpServer";
import { generateMockAgent } from "./agentGenerator";

// Helper function to generate mock traits based on spirit
function generateMockTraits(spirit: string): AgentTraits {
  const baseTraits = {
    personality: {
      dominance: Math.random(),
      independence: Math.random(),
      patience: Math.random(),
      aggression: Math.random(),
      charisma: Math.random(),
      creativity: Math.random(),
      perfectionism: Math.random(),
      adaptability: Math.random(),
      playfulness: Math.random(),
      intelligence: Math.random(),
      loyalty: Math.random(),
      curiosity: Math.random(),
      courage: Math.random(),
      empathy: Math.random(),
      determination: Math.random(),
      spontaneity: Math.random(),
    },
    physical: {
      size: Math.random(),
      strength: Math.random(),
      agility: Math.random(),
      endurance: Math.random(),
      appearance: Math.random(),
      grace: Math.random(),
      speed: Math.random(),
      coordination: Math.random(),
      stamina: Math.random(),
      flexibility: Math.random(),
      reflexes: Math.random(),
      vitality: Math.random(),
    },
    abilities: {
      strategist: Math.random(),
      hunter: Math.random(),
      teacher: Math.random(),
      artist: Math.random(),
      healer: Math.random(),
      inventor: Math.random(),
      explorer: Math.random(),
      guardian: Math.random(),
      diplomat: Math.random(),
      warrior: Math.random(),
      scholar: Math.random(),
      performer: Math.random(),
      builder: Math.random(),
      navigator: Math.random(),
      communicator: Math.random(),
      leader: Math.random(),
    },
  };

  // Adjust traits based on spirit
  if (spirit === "fox") {
    baseTraits.personality.intelligence = Math.max(0.7, baseTraits.personality.intelligence);
    baseTraits.abilities.strategist = Math.max(0.8, baseTraits.abilities.strategist);
  } else if (spirit === "wolf") {
    baseTraits.personality.loyalty = Math.max(0.8, baseTraits.personality.loyalty);
    baseTraits.abilities.guardian = Math.max(0.7, baseTraits.abilities.guardian);
  } else if (spirit === "otter") {
    baseTraits.personality.playfulness = Math.max(0.8, baseTraits.personality.playfulness);
    baseTraits.abilities.performer = Math.max(0.7, baseTraits.abilities.performer);
  }

  return baseTraits;
}

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
      console.log("🦊 Refreshing agents from ECS system...");

      // Get agent positions from ECS system
      const positionsResponse = await mcpServer.callMCPTool("get_ecs_agent_positions");
      console.log("📡 Raw positions response:", positionsResponse);

      const positionsData = JSON.parse(positionsResponse.content[0].text);
      console.log("📊 Parsed positions data:", positionsData);

      // Debug: Log the spirits and ages of the first few agents
      console.log(
        "🔍 First 10 agents spirits and ages:",
        positionsData.slice(0, 10).map(agent => ({
          id: agent.id,
          name: agent.name,
          spirit: agent.spirit,
          style: agent.style,
          age: agent.age,
          maturity_age: agent.maturity_age,
        }))
      );

      if (positionsData.length === 0) {
        console.log("⚠️ No agents found in ECS system, using mock data");
        // If no agents in ECS, use mock data
        const mockAgents = [
          generateMockAgent("mock-1", "fox", "foundation"),
          generateMockAgent("mock-2", "wolf", "exo"),
          generateMockAgent("mock-3", "otter", "hybrid"),
          generateMockAgent("mock-4", "eagle", "mythological"),
          generateMockAgent("mock-5", "lion", "scientific"),
        ];
        setAgents(mockAgents);
      } else {
        // Convert ECS data to our agent format
        const ecsAgents: AgentEntity[] = positionsData.map((agentData: any) => ({
          id: agentData.id,
          name: agentData.name,
          spirit: agentData.spirit,
          style: agentData.style,
          position: agentData.position,
          age: agentData.age || 0, // Use real age from backend
          maturityAge: agentData.maturity_age || 18, // Use real maturity age from backend
          traits: generateMockTraits(agentData.spirit),
          lineage: {
            parents: [],
            children: [],
            ancestors: [],
            descendants: [],
          },
        }));

        console.log("✅ Converted ECS agents:", ecsAgents);

        // Debug: Log the spirits and ages of converted agents
        console.log(
          "🔍 Converted agents spirits and ages:",
          ecsAgents.slice(0, 10).map(agent => ({
            id: agent.id,
            name: agent.name,
            spirit: agent.spirit,
            style: agent.style,
            age: agent.age,
            maturityAge: agent.maturityAge,
            isMature: agent.age >= agent.maturityAge,
          }))
        );

        setAgents(ecsAgents);
      }

      setIsConnected(true);
    } catch (error) {
      console.error("❌ Failed to refresh agents:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (spirit: string, style: string) => {
    try {
      setIsLoading(true);
      console.log(`🦊 Creating new ${spirit} agent with ${style} style...`);
      await mcpServer.callMCPTool("create_ecs_agent", {
        agent_id: `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        spirit,
        style,
      });

      // Refresh agents to get the new one from ECS
      await refreshAgents();
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
        offspring_id: `offspring-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      });

      // Refresh agents to get the new offspring from ECS
      await refreshAgents();
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

  const startGlobalBreeding = async () => {
    try {
      console.log("🌱 Starting global breeding scheduler...");
      await mcpServer.callMCPTool("start_global_breeding", {});
      console.log("✅ Global breeding scheduler started");
    } catch (error) {
      console.error("❌ Failed to start global breeding:", error);
    }
  };

  const stopGlobalBreeding = async () => {
    try {
      console.log("🛑 Stopping global breeding scheduler...");
      await mcpServer.callMCPTool("stop_global_breeding", {});
      console.log("✅ Global breeding scheduler stopped");
    } catch (error) {
      console.error("❌ Failed to stop global breeding:", error);
    }
  };

  const getBreedingStatistics = async () => {
    try {
      console.log("📊 Getting breeding statistics...");
      const response = await mcpServer.callMCPTool("get_breeding_statistics", {});
      const stats = JSON.parse(response.content[0].text);
      console.log("📊 Breeding statistics:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Failed to get breeding statistics:", error);
      return null;
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
      console.log("⏰ Getting simulation status from server...");
      const response = await mcpServer.callMCPTool("get_simulation_status");
      console.log("📡 Raw simulation status response:", response);

      // Parse the text format response
      const statusText = response.content[0].text;
      console.log("📝 Status text:", statusText);

      const statusData = parseSimulationStatusText(statusText);
      console.log("📊 Parsed simulation status:", statusData);

      return statusData;
    } catch (error) {
      console.error("❌ Failed to get simulation status:", error);
      return null;
    }
  };

  const parseSimulationStatusText = (text: string) => {
    const lines = text.split("\n");
    const status: Record<string, any> = {};

    for (const line of lines) {
      if (line.includes(":")) {
        const [key, value] = line.split(":").map(s => s.trim());
        if (key && value) {
          // Convert numeric values
          if (value.includes(".")) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              status[key] = numValue;
            } else {
              status[key] = value;
            }
          } else if (!isNaN(Number(value))) {
            status[key] = Number(value);
          } else {
            status[key] = value;
          }
        }
      }
    }

    return status;
  };

  const refreshSimulationStatus = async () => {
    try {
      const statusData = await getSimulationStatus();
      if (statusData) {
        console.log("✅ Updated simulation status from server:", statusData);
        return statusData;
      }
    } catch (error) {
      console.error("❌ Failed to refresh simulation status:", error);
    }
    return null;
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
    refreshSimulationStatus,
    startGlobalBreeding,
    stopGlobalBreeding,
    getBreedingStatistics,
  };
}
