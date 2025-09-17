/**
 * SystemStats Component
 * Displays comprehensive system statistics and health monitoring
 */

import { Component, For } from "solid-js";
import { Card } from "reynard-components";

interface SystemStatsProps {
  systemStats: any;
}

export const SystemStats: Component<SystemStatsProps> = props => {
  return (
    <div class="system-stats">
      <Card class="overview-stats" padding="lg">
        <h3>System Overview</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Total Processed</h4>
            <p class="stat-value">{props.systemStats?.totalProcessed || 0}</p>
          </div>
          <div class="stat-card">
            <h4>Loaded Models</h4>
            <p class="stat-value">{props.systemStats?.loadedModels || 0}</p>
          </div>
          <div class="stat-card">
            <h4>System Health</h4>
            <p class={`stat-value ${props.systemStats?.isHealthy ? "healthy" : "unhealthy"}`}>
              {props.systemStats?.isHealthy ? "✅ Healthy" : "❌ Unhealthy"}
            </p>
          </div>
          <div class="stat-card">
            <h4>Active Tasks</h4>
            <p class="stat-value">{props.systemStats?.activeTasks || 0}</p>
          </div>
        </div>
      </Card>

      <Card class="model-stats" padding="lg">
        <h3>Model Statistics</h3>
        <div class="models-stats">
          <For each={props.systemStats?.generators || []}>
            {generator => (
              <div class="model-stat-item">
                <div class="model-header">
                  <h4>{generator.name}</h4>
                  <div class="model-status">
                    <span class={`status-badge ${generator.isLoaded ? "loaded" : "unloaded"}`}>
                      {generator.isLoaded ? "Loaded" : "Unloaded"}
                    </span>
                    <span class={`status-badge ${generator.healthStatus?.isHealthy ? "healthy" : "unhealthy"}`}>
                      {generator.healthStatus?.isHealthy ? "Healthy" : "Unhealthy"}
                    </span>
                  </div>
                </div>

                {generator.usageStats && (
                  <div class="usage-stats">
                    <div class="usage-item">
                      <span>Total Requests:</span>
                      <span>{generator.usageStats.totalRequests}</span>
                    </div>
                    <div class="usage-item">
                      <span>Success Rate:</span>
                      <span>
                        {generator.usageStats.totalRequests > 0
                          ? Math.round(
                              (generator.usageStats.successfulRequests / generator.usageStats.totalRequests) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div class="usage-item">
                      <span>Avg Processing Time:</span>
                      <span>{generator.usageStats.averageProcessingTime?.toFixed(2)}s</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      </Card>

      <Card class="queue-stats" padding="lg">
        <h3>Queue Status</h3>
        <div class="queue-info">
          <div class="queue-item">
            <span>Total Queued:</span>
            <span>{props.systemStats?.queueStatus?.totalQueued || 0}</span>
          </div>
          <div class="queue-item">
            <span>Average Wait Time:</span>
            <span>
              {props.systemStats?.queueStatus?.averageWaitTime?.toFixed(2) || 0}
              ms
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
