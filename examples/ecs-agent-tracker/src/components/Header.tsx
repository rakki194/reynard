import { createSignal } from "solid-js";
import type { SimulationStatus } from "../types";

interface HeaderProps {
  simulationStatus: SimulationStatus;
  isConnected: boolean;
  onTimeAcceleration: (factor: number) => void;
  onToggleReproduction: (enabled: boolean) => void;
  onUpdateSimulation: (deltaTime?: number) => void;
  onStartGlobalBreeding: () => void;
  onStopGlobalBreeding: () => void;
  onGetBreedingStatistics: () => void;
  currentPage: "tracker" | "config";
  onPageChange: (page: "tracker" | "config") => void;
}

export function Header(props: HeaderProps) {
  const [timeFactor, setTimeFactor] = createSignal(props.simulationStatus.timeAcceleration);

  const handleTimeFactorChange = (factor: number) => {
    setTimeFactor(factor);
    props.onTimeAcceleration(factor);
  };

  const handleToggleReproduction = () => {
    props.onToggleReproduction(!props.simulationStatus.automaticReproduction);
  };

  return (
    <header class="header">
      <div class="header-left">
        <h1>
          🦊 ECS Agent Tracker
          <span
            style={{
              color: props.isConnected ? "#48bb78" : "#f56565",
              "font-size": "0.8rem",
              "margin-left": "0.5rem",
            }}
          >
            {props.isConnected ? "● Connected" : "● Disconnected"}
          </span>
        </h1>

        <nav class="nav-tabs">
          <button
            class={`nav-tab ${props.currentPage === "tracker" ? "active" : ""}`}
            onClick={() => props.onPageChange("tracker")}
          >
            🌍 Agent Tracker
          </button>
          <button
            class={`nav-tab ${props.currentPage === "config" ? "active" : ""}`}
            onClick={() => props.onPageChange("config")}
          >
            🛠️ Tool Config
          </button>
        </nav>
      </div>

      <div class="controls">
        <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
          <label style={{ color: "white", "font-size": "0.9rem" }}>Time Speed:</label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={timeFactor()}
            onInput={e => handleTimeFactorChange(parseFloat(e.currentTarget.value))}
            style={{ width: "100px" }}
          />
          <span style={{ color: "white", "font-size": "0.9rem", "min-width": "30px" }}>{timeFactor().toFixed(1)}x</span>
        </div>

        <button
          class="button"
          onClick={handleToggleReproduction}
          style={{
            "background-color": props.simulationStatus.automaticReproduction ? "#48bb78" : "#e53e3e",
          }}
        >
          {props.simulationStatus.automaticReproduction ? "🔄 Auto-Breed" : "⏸️ Manual"}
        </button>

        <button class="button" onClick={() => props.onUpdateSimulation(1.0)} style={{ "background-color": "#4299e1" }}>
          ⏭️ Step
        </button>

        <button class="button" onClick={props.onStartGlobalBreeding} style={{ "background-color": "#9f7aea" }}>
          🌱 Start Breeding
        </button>

        <button class="button" onClick={props.onStopGlobalBreeding} style={{ "background-color": "#ed8936" }}>
          🛑 Stop Breeding
        </button>

        <button class="button" onClick={props.onGetBreedingStatistics} style={{ "background-color": "#38b2ac" }}>
          📊 Breeding Stats
        </button>

        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "1rem",
            color: "white",
            "font-size": "0.9rem",
          }}
        >
          <span>
            Agents: <strong>{props.simulationStatus.totalAgents}</strong>
          </span>
          <span>
            Mature: <strong>{props.simulationStatus.matureAgents}</strong>
          </span>
          <span>
            Time: <strong>{props.simulationStatus.simulationTime.toFixed(1)}s</strong>
          </span>
        </div>
      </div>
    </header>
  );
}
