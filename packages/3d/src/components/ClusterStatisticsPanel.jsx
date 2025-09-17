import { Show, createSignal, For } from "solid-js";
import "./ClusterStatisticsPanel.css";
const ClusterStatItem = (props) => (<div class={`stat-item ${props.isHovered ? "hovered" : ""} ${props.isSelected ? "selected" : ""}`} onClick={() => props.onSelect()}>
    <div class="stat-header">
      <span class="cluster-name">{props.cluster.label}</span>
      <span class="cluster-size">{props.cluster.statistics.size} points</span>
    </div>
    <div class="stat-details">
      <div class="stat-row">
        <span>Density:</span>
        <span>{props.cluster.statistics.density.toFixed(2)}</span>
      </div>
      <div class="stat-row">
        <span>Variance:</span>
        <span>{props.cluster.statistics.variance.toFixed(2)}</span>
      </div>
      <div class="stat-row">
        <span>Avg Similarity:</span>
        <span>{props.cluster.statistics.averageSimilarity.toFixed(2)}</span>
      </div>
    </div>
  </div>);
export const ClusterStatisticsPanel = (props) => {
    const [showStatistics, setShowStatistics] = createSignal(true);
    return (<div class="cluster-visualization">
      <Show when={showStatistics()}>
        <div class="cluster-stats">
          <h3>Cluster Statistics</h3>
          <div class="stats-grid">
            <For each={props.clusters}>
              {(cluster) => (<ClusterStatItem cluster={cluster} isHovered={props.hoveredClusterId === cluster.id} isSelected={props.selectedClusterId === cluster.id} onSelect={() => props.onClusterSelect?.(cluster.id)}/>)}
            </For>
          </div>
        </div>
      </Show>

      <div class="cluster-controls">
        <button onClick={() => setShowStatistics(!showStatistics())} class="toggle-stats">
          {showStatistics() ? "Hide" : "Show"} Statistics
        </button>
      </div>
    </div>);
};
