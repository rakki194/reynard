import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Router, Routes, Route, useNavigate, useLocation } from "@solidjs/router";
import { AgentGrid } from "./components/AgentGrid";
import { AgentSidebar } from "./components/AgentSidebar";
import { Header } from "./components/Header";
import { useECSAgentTracker } from "./composables/useECSAgentTracker";
import ToolConfigPage from "./pages/ToolConfigPage";
import type { AgentEntity, SimulationStatus } from "./types";

// Main App component with routing
export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// App content component that uses routing
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
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
    refreshSimulationStatus,
    isConnected,
    startGlobalBreeding,
    stopGlobalBreeding,
    getBreedingStatistics,
  } = useECSAgentTracker();

  // Update simulation status when agents change
  createEffect(() => {
    const agentList = agents();
    setSimulationStatus(prev => ({
      ...prev,
      totalAgents: agentList.length,
      matureAgents: agentList.filter(agent => agent.age >= agent.maturityAge).length,
    }));
  });

  // Auto-refresh agents and simulation status every 2 seconds
  let refreshInterval: number;
  onMount(() => {
    console.log("🚀 ECS Agent Tracker mounted, starting auto-refresh...");
    refreshInterval = setInterval(async () => {
      console.log("🔄 Auto-refreshing agents and simulation status...");
      await refreshAgents();
      const serverStatus = await refreshSimulationStatus();
      if (serverStatus) {
        console.log("🔄 Updating simulation status from server:", serverStatus);
        setSimulationStatus(prev => ({
          ...prev,
          simulationTime: serverStatus["Simulation Time"] || 0,
          timeAcceleration: serverStatus["Time Acceleration"] || 1,
          totalAgents: serverStatus["Total Agents"] || 0,
          matureAgents: serverStatus["Mature Agents"] || 0,
        }));
      }
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

  const handlePageChange = (page: "tracker" | "config") => {
    navigate(page === "tracker" ? "/" : "/config");
  };

  const getCurrentPage = () => {
    return location.pathname === "/config" ? "config" : "tracker";
  };

  return (
    <div class="app">
      <Header
        simulationStatus={simulationStatus()}
        isConnected={isConnected()}
        onTimeAcceleration={handleTimeAcceleration}
        onToggleReproduction={handleToggleReproduction}
        onUpdateSimulation={updateSimulation}
        onStartGlobalBreeding={startGlobalBreeding}
        onStopGlobalBreeding={stopGlobalBreeding}
        onGetBreedingStatistics={getBreedingStatistics}
        currentPage={getCurrentPage()}
        onPageChange={handlePageChange}
      />

      <Routes>
        <Route
          path="/"
          component={() => (
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
          )}
        />
        <Route path="/config" component={ToolConfigPage} />
      </Routes>
    </div>
  );
}
