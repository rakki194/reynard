import { createSignal, createEffect, For } from "solid-js";
import type { AgentEntity } from "../types";

interface AgentGridProps {
  agents: AgentEntity[];
  selectedAgent: AgentEntity | null;
  onAgentSelect: (agent: AgentEntity) => void;
}

export function AgentGrid(props: AgentGridProps) {
  const [gridSize, setGridSize] = createSignal({ width: 900, height: 700 });

  // Update grid size on window resize
  createEffect(() => {
    const updateSize = () => {
      const container = document.querySelector(".grid-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        setGridSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  });

  const handleAgentClick = (agent: AgentEntity) => {
    props.onAgentSelect(agent);
  };

  const getAgentEmoji = (spirit: string) => {
    const emojiMap: Record<string, string> = {
      fox: "🦊",
      wolf: "🐺",
      otter: "🦦",
      eagle: "🦅",
      lion: "🦁",
      dolphin: "🐬",
    };
    return emojiMap[spirit] || "🤖";
  };

  const getAgentColor = (spirit: string) => {
    const colorMap: Record<string, string> = {
      fox: "#ff6b35",
      wolf: "#4a5568",
      otter: "#38b2ac",
      eagle: "#d69e2e",
      lion: "#ed8936",
      dolphin: "#4299e1",
    };
    return colorMap[spirit] || "#667eea";
  };

  return (
    <div class="agent-grid" style={{ width: "100%", height: "100%" }}>
      {/* Grid background */}
      <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, "z-index": 1 }}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Agent entities */}
      <For each={props.agents}>
        {agent => (
          <div
            class={`agent-entity ${agent.spirit} ${agent.id === props.selectedAgent?.id ? "selected" : ""}`}
            style={{
              left: `${(agent.position.x / gridSize().width) * 100}%`,
              top: `${(agent.position.y / gridSize().height) * 100}%`,
              "background-color": getAgentColor(agent.spirit),
              "z-index": agent.id === props.selectedAgent?.id ? 20 : 10,
            }}
            onClick={() => handleAgentClick(agent)}
            title={`${agent.name} (${agent.spirit}) - Age: ${agent.age}`}
          >
            {getAgentEmoji(agent.spirit)}
          </div>
        )}
      </For>

      {/* Connection lines for parent-child relationships */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, "z-index": 2, "pointer-events": "none" }}
      >
        <For each={props.agents}>
          {agent => {
            if (agent.lineage.parents.length === 0) return null;

            return agent.lineage.parents.map(parentId => {
              const parent = props.agents.find(a => a.id === parentId);
              if (!parent) return null;

              const startX = (parent.position.x / gridSize().width) * 100;
              const startY = (parent.position.y / gridSize().height) * 100;
              const endX = (agent.position.x / gridSize().width) * 100;
              const endY = (agent.position.y / gridSize().height) * 100;

              return (
                <line
                  x1={`${startX}%`}
                  y1={`${startY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke="rgba(102, 126, 234, 0.3)"
                  stroke-width="2"
                  stroke-dasharray="5,5"
                />
              );
            });
          }}
        </For>
      </svg>

      {/* Grid info overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "0.5rem",
          "border-radius": "4px",
          "font-size": "0.8rem",
          "z-index": 100,
        }}
      >
        Grid: {gridSize().width}×{gridSize().height} | Agents: {props.agents.length}
      </div>
    </div>
  );
}
