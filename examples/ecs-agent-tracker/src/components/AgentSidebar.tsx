import { createSignal, For } from "solid-js";
import type { AgentEntity, SimulationStatus } from "../types";

interface AgentSidebarProps {
  selectedAgent: AgentEntity | null;
  agents: AgentEntity[];
  simulationStatus: SimulationStatus;
  onCreateAgent: (spirit: string, style: string) => void;
  onCreateOffspring: (parent1Id: string, parent2Id: string) => void;
}

export function AgentSidebar(props: AgentSidebarProps) {
  const [newAgentSpirit, setNewAgentSpirit] = createSignal("fox");
  const [newAgentStyle, setNewAgentStyle] = createSignal("foundation");
  const [selectedParent1, setSelectedParent1] = createSignal("");
  const [selectedParent2, setSelectedParent2] = createSignal("");

  const spirits = ["fox", "wolf", "otter", "eagle", "lion", "dolphin"];
  const styles = ["foundation", "exo", "hybrid", "cyberpunk", "mythological", "scientific"];

  const handleCreateAgent = () => {
    props.onCreateAgent(newAgentSpirit(), newAgentStyle());
  };

  const handleCreateOffspring = () => {
    if (selectedParent1() && selectedParent2() && selectedParent1() !== selectedParent2()) {
      props.onCreateOffspring(selectedParent1(), selectedParent2());
      setSelectedParent1("");
      setSelectedParent2("");
    }
  };

  const getTopTraits = (traits: AgentEntity["traits"], category: keyof AgentEntity["traits"], count: number = 3) => {
    const traitEntries = Object.entries(traits[category])
      .sort(([, a], [, b]) => b - a)
      .slice(0, count);

    return traitEntries.map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value * 100),
    }));
  };

  const getCompatibleMates = (agent: AgentEntity) => {
    return props.agents.filter(
      other => other.id !== agent.id && other.spirit === agent.spirit && other.age >= other.maturityAge
    );
  };

  return (
    <div class="sidebar">
      {/* Simulation Stats */}
      <div class="stats-panel">
        <h3>📊 Simulation Stats</h3>
        <div class="stat-item">
          <span class="stat-label">Total Agents:</span>
          <span class="stat-value">{props.simulationStatus.totalAgents}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Mature Agents:</span>
          <span class="stat-value">{props.simulationStatus.matureAgents}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Time Speed:</span>
          <span class="stat-value">{props.simulationStatus.timeAcceleration.toFixed(1)}x</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Auto-Breeding:</span>
          <span class="stat-value">{props.simulationStatus.automaticReproduction ? "ON" : "OFF"}</span>
        </div>
      </div>

      {/* Create New Agent */}
      <div class="controls-panel">
        <h3>🦊 Create Agent</h3>
        <div class="control-group">
          <label>Spirit:</label>
          <select value={newAgentSpirit()} onInput={e => setNewAgentSpirit(e.currentTarget.value)}>
            <For each={spirits}>
              {spirit => <option value={spirit}>{spirit.charAt(0).toUpperCase() + spirit.slice(1)}</option>}
            </For>
          </select>
        </div>
        <div class="control-group">
          <label>Style:</label>
          <select value={newAgentStyle()} onInput={e => setNewAgentStyle(e.currentTarget.value)}>
            <For each={styles}>
              {style => <option value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>}
            </For>
          </select>
        </div>
        <button class="button" onClick={handleCreateAgent}>
          Create Agent
        </button>
      </div>

      {/* Create Offspring */}
      <div class="controls-panel">
        <h3>🧬 Create Offspring</h3>
        <div class="control-group">
          <label>Parent 1:</label>
          <select value={selectedParent1()} onInput={e => setSelectedParent1(e.currentTarget.value)}>
            <option value="">Select Parent 1</option>
            <For each={props.agents.filter(agent => agent.age >= agent.maturityAge)}>
              {agent => (
                <option value={agent.id}>
                  {agent.name} ({agent.spirit})
                </option>
              )}
            </For>
          </select>
        </div>
        <div class="control-group">
          <label>Parent 2:</label>
          <select value={selectedParent2()} onInput={e => setSelectedParent2(e.currentTarget.value)}>
            <option value="">Select Parent 2</option>
            <For each={props.agents.filter(agent => agent.age >= agent.maturityAge && agent.id !== selectedParent1())}>
              {agent => (
                <option value={agent.id}>
                  {agent.name} ({agent.spirit})
                </option>
              )}
            </For>
          </select>
        </div>
        <button
          class="button"
          onClick={handleCreateOffspring}
          disabled={!selectedParent1() || !selectedParent2() || selectedParent1() === selectedParent2()}
        >
          Create Offspring
        </button>
      </div>

      {/* Selected Agent Info */}
      {props.selectedAgent ? (
        <div class="agent-info">
          <h3>🎭 {props.selectedAgent.name}</h3>
          <div style={{ "margin-bottom": "1rem" }}>
            <strong>Spirit:</strong> {props.selectedAgent.spirit} |<strong> Style:</strong> {props.selectedAgent.style}{" "}
            |<strong> Age:</strong> {props.selectedAgent.age}
          </div>

          {/* Top Personality Traits */}
          <div>
            <h4>🧠 Top Personality Traits</h4>
            <div class="agent-traits">
              <For each={getTopTraits(props.selectedAgent.traits, "personality")}>
                {trait => (
                  <div class="trait-item">
                    {trait.name}: {trait.value}%
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Top Physical Traits */}
          <div>
            <h4>💪 Top Physical Traits</h4>
            <div class="agent-traits">
              <For each={getTopTraits(props.selectedAgent.traits, "physical")}>
                {trait => (
                  <div class="trait-item">
                    {trait.name}: {trait.value}%
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Top Abilities */}
          <div>
            <h4>⚡ Top Abilities</h4>
            <div class="agent-traits">
              <For each={getTopTraits(props.selectedAgent.traits, "abilities")}>
                {trait => (
                  <div class="trait-item">
                    {trait.name}: {trait.value}%
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Lineage */}
          <div class="lineage-tree">
            <h4>🌳 Lineage</h4>
            {props.selectedAgent.lineage.parents.length > 0 && (
              <div>
                <strong>Parents:</strong>
                <For each={props.selectedAgent.lineage.parents}>
                  {parentId => {
                    const parent = props.agents.find(a => a.id === parentId);
                    return parent ? <div class="lineage-item">• {parent.name}</div> : null;
                  }}
                </For>
              </div>
            )}
            {props.selectedAgent.lineage.children.length > 0 && (
              <div>
                <strong>Children:</strong>
                <For each={props.selectedAgent.lineage.children}>
                  {childId => {
                    const child = props.agents.find(a => a.id === childId);
                    return child ? <div class="lineage-item">• {child.name}</div> : null;
                  }}
                </For>
              </div>
            )}
            {props.selectedAgent.lineage.parents.length === 0 && props.selectedAgent.lineage.children.length === 0 && (
              <div class="lineage-item">No lineage data</div>
            )}
          </div>

          {/* Compatible Mates */}
          {props.selectedAgent.age >= props.selectedAgent.maturityAge && (
            <div class="lineage-tree">
              <h4>💕 Compatible Mates</h4>
              {getCompatibleMates(props.selectedAgent).length > 0 ? (
                getCompatibleMates(props.selectedAgent).map(mate => (
                  <div class="lineage-item">
                    • {mate.name} ({mate.spirit})
                  </div>
                ))
              ) : (
                <div class="lineage-item">No compatible mates found</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div class="no-agent-selected">
          <h3>🎯 Select an Agent</h3>
          <p>
            Click on an agent in the grid to view detailed information about their traits, lineage, and capabilities.
          </p>
        </div>
      )}
    </div>
  );
}
