/**
 * Model Manager Sub-components
 *
 * Sub-components for the Model Manager to keep the main component
 * under the 140-line limit.
 */
import { Show, For } from "solid-js";
// System Health Overview Component
export const HealthOverview = (props) => (<Show when={props.systemHealth}>
    <div class="health-overview">
      <div class="health-status">
        <div class="status-indicator" classList={{
        "status-indicator--healthy": props.systemHealth?.isHealthy,
        "status-indicator--unhealthy": !props.systemHealth?.isHealthy,
    }}>
          <div class="status-dot"/>
          <span class="status-text">
            {props.systemHealth?.isHealthy ? "System Healthy" : "System Issues"}
          </span>
        </div>
      </div>

      <div class="performance-metrics">
        <div class="metric">
          <span class="metric-label">CPU Usage</span>
          <span class="metric-value">
            {props.systemHealth?.performance.cpuUsage.toFixed(1)}%
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory Usage</span>
          <span class="metric-value">
            {props.systemHealth?.performance.memoryUsage.toFixed(1)}%
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Queue Length</span>
          <span class="metric-value">
            {props.systemHealth?.performance.queueLength}
          </span>
        </div>
      </div>
    </div>
  </Show>);
// Model Card Component
export const ModelCard = (props) => (<div class="model-card" classList={{
        "model-card--loaded": props.model.isLoaded,
        "model-card--loading": props.model.isLoading,
    }}>
    <div class="model-header">
      <div class="model-name">{props.model.displayName}</div>
      <div class="model-status">
        <div class="status-indicator" classList={{
        "status-indicator--loaded": props.model.isLoaded,
        "status-indicator--unloaded": !props.model.isLoaded,
        "status-indicator--loading": props.model.isLoading,
    }}>
          <div class="status-dot"/>
          <span class="status-text">
            {props.model.isLoading
        ? "Loading..."
        : props.model.isLoaded
            ? "Loaded"
            : "Unloaded"}
          </span>
        </div>
      </div>
    </div>

    <div class="model-description">{props.model.description}</div>

    <Show when={props.model.usageStats}>
      <div class="model-stats">
        <div class="stat">
          <span class="stat-label">Requests</span>
          <span class="stat-value">
            {props.model.usageStats?.totalRequests || 0}
          </span>
        </div>
        <div class="stat">
          <span class="stat-label">Success Rate</span>
          <span class="stat-value">
            {props.model.usageStats?.totalRequests
        ? ((props.model.usageStats.successfulRequests /
            props.model.usageStats.totalRequests) *
            100).toFixed(1)
        : 0}
            %
          </span>
        </div>
        <div class="stat">
          <span class="stat-label">Avg Time</span>
          <span class="stat-value">
            {props.model.usageStats?.averageProcessingTime?.toFixed(2) || 0}s
          </span>
        </div>
      </div>
    </Show>

    <div class="model-actions">
      <Show when={!props.model.isLoaded && !props.model.isLoading}>
        <button type="button" class="action-button action-button--load" onClick={() => props.onLoad(props.model.name)}>
          Load Model
        </button>
      </Show>
      <Show when={props.model.isLoaded && !props.model.isLoading}>
        <button type="button" class="action-button action-button--unload" onClick={() => props.onUnload(props.model.name)}>
          Unload Model
        </button>
      </Show>
      <Show when={props.model.isLoading}>
        <div class="loading-spinner"/>
      </Show>
    </div>
  </div>);
// Models Grid Component
export const ModelsGrid = (props) => (<div class="models-section">
    <h4 class="section-title">Available Models</h4>
    <div class="models-grid">
      <For each={props.models}>
        {(model) => (<ModelCard model={model} onLoad={props.onLoad} onUnload={props.onUnload}/>)}
      </For>
    </div>
  </div>);
