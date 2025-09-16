import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { AgentGrid } from "./components/AgentGrid";
import { AgentSidebar } from "./components/AgentSidebar";
import { Header } from "./components/Header";
import { useECSAgentTracker } from "./composables/useECSAgentTracker";
import type { AgentEntity, SimulationStatus } from "./types";

export function App() {
  const [selectedAgent, setSelectedAgent] = createSignal<AgentEntity | null>(null);
  const [simulationStatus, setSimulationStatus] = createSignal<SimulationStatus>({
    totalAgents: 0,
    matureAgents: 0,
    simulationTime: 0,
    timeAcceleration: 1,
    automaticReproduction: true,
  });

  const {
    agents,
    createAgent,
    createOffspring,
    updateSimulation,
    accelerateTime,
    enableAutomaticReproduction,
    refreshAgents,
    isConnected,
  } = useECSAgentTracker();

  // Update simulation status when agents change
  createEffect(() => {
    const agentList = agents();
    setSimulationStatus(prev => ({
      ...prev,
      totalAgents: agentList.length,
      matureAgents: agentList.filter(agent => agent.age >= 18).length,
    }));
  });

  // Auto-refresh agents every 2 seconds
  let refreshInterval: number;
  onMount(() => {
    refreshInterval = setInterval(() => {
      refreshAgents();
    }, 2000);
  });

  onCleanup(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  const handleAgentSelect = (agent: AgentEntity) => {
    setSelectedAgent(agent);
  };

  const handleCreateAgent = async (spirit: string, style: string) => {
    await createAgent(spirit, style);
    refreshAgents();
  };

  const handleCreateOffspring = async (parent1Id: string, parent2Id: string) => {
    await createOffspring(parent1Id, parent2Id);
    refreshAgents();
  };

  const handleTimeAcceleration = (factor: number) => {
    accelerateTime(factor);
    setSimulationStatus(prev => ({ ...prev, timeAcceleration: factor }));
  };

  const handleToggleReproduction = (enabled: boolean) => {
    enableAutomaticReproduction(enabled);
    setSimulationStatus(prev => ({ ...prev, automaticReproduction: enabled }));
  };

  return (
    <div class="app">
      <Header
        simulationStatus={simulationStatus()}
        isConnected={isConnected()}
        onTimeAcceleration={handleTimeAcceleration}
        onToggleReproduction={handleToggleReproduction}
        onUpdateSimulation={updateSimulation}
      />

      <div class="main-content">
        <div class="grid-container">
          <AgentGrid agents={agents()} selectedAgent={selectedAgent()} onAgentSelect={handleAgentSelect} />
        </div>

        <AgentSidebar
          selectedAgent={selectedAgent()}
          agents={agents()}
          simulationStatus={simulationStatus()}
          onCreateAgent={handleCreateAgent}
          onCreateOffspring={handleCreateOffspring}
        />
      </div>
    </div>
  );
}
