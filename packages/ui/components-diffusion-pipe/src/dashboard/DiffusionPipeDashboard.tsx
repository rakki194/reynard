/**
 * 🦊 Diffusion-Pipe Dashboard
 *
 * Main dashboard component for diffusion-pipe training management
 * following Reynard's ServiceManagementDashboard pattern with real-time monitoring.
 */

import { Show, createSignal, createEffect, onMount, onCleanup, Component } from "solid-js";
import { Tabs } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { Card } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { TrainingCard } from "../training/TrainingCard";
import { TrainingProgress } from "../training/TrainingProgress";
import { TrainingMetrics } from "../training/TrainingMetrics";
import { TrainingLogs } from "../training/TrainingLogs";
import { ResourceMonitor } from "../training/ResourceMonitor";
import { useTrainingProgress } from "../hooks/useTrainingProgress";
import { useRealTimeUpdates } from "../hooks/useRealTimeUpdates";
import { ConfigBuilder } from "../config/ConfigBuilder";
import { ChromaTrainingWizard } from "../chroma/ChromaTrainingWizard";
import { ChromaModelValidator } from "../chroma/ChromaModelValidator";
import { ChromaPresets } from "../chroma/ChromaPresets";

export interface DiffusionPipeDashboardProps {
  title?: string;
  refreshInterval?: number;
  showChromaWizard?: boolean;
  onTrainingStart?: (config: any) => void;
  onTrainingStop?: (trainingId: string) => void;
  onConfigSave?: (config: any) => void;
}

export const DiffusionPipeDashboard: Component<DiffusionPipeDashboardProps> = props => {
  const [activeTab, setActiveTab] = createSignal("overview");
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [lastRefresh, setLastRefresh] = createSignal<Date | null>(null);
  const [trainings, setTrainings] = createSignal<any[]>([]);
  const [isConnected, setIsConnected] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Real-time updates hook
  const realTimeUpdates = useRealTimeUpdates({
    onUpdate: data => {
      if (data.type === "training_update") {
        setTrainings(prev => prev.map(t => (t.id === data.trainingId ? { ...t, ...data.data } : t)));
      }
    },
    onError: err => setError(err),
  });

  // Training progress hook
  const trainingProgress = useTrainingProgress();

  // Auto-refresh functionality
  let refreshInterval: NodeJS.Timeout | undefined;

  onMount(() => {
    // Initial data load
    refreshAll();

    // Connect to real-time updates
    realTimeUpdates.connect().catch(err => {
      console.error("Failed to connect to real-time updates:", err);
      setError("Failed to connect to real-time updates");
    });
  });

  onCleanup(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    realTimeUpdates.disconnect();
  });

  createEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    if (props.refreshInterval && props.refreshInterval > 0) {
      refreshInterval = setInterval(async () => {
        await refreshAll();
      }, props.refreshInterval);
    }
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  // Refresh all training data
  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await loadTrainings();
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to refresh training data:", error);
      setError(error instanceof Error ? error.message : "Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadTrainings = async () => {
    try {
      // This would typically call the API client
      // const client = createDiffusionPipeClient();
      // const result = await client.getTrainings();
      // setTrainings(result.items);

      // Mock data for now
      setTrainings([
        {
          id: "1",
          status: "running",
          progress: 45,
          current_epoch: 450,
          total_epochs: 1000,
          start_time: new Date().toISOString(),
          model_type: "chroma",
          config: { rank: 32, lr: 2.5e-4 },
        },
        {
          id: "2",
          status: "completed",
          progress: 100,
          current_epoch: 1000,
          total_epochs: 1000,
          start_time: new Date(Date.now() - 86400000).toISOString(),
          end_time: new Date().toISOString(),
          model_type: "chroma",
          config: { rank: 32, lr: 2.5e-4 },
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trainings");
    }
  };

  const handleTrainingStart = (config: any) => {
    props.onTrainingStart?.(config);
    // Refresh trainings after starting
    loadTrainings();
  };

  const handleTrainingStop = (trainingId: string) => {
    props.onTrainingStop?.(trainingId);
    // Refresh trainings after stopping
    loadTrainings();
  };

  const handleConfigSave = (config: any) => {
    props.onConfigSave?.(config);
  };

  // Get overall system health
  const getSystemHealth = () => {
    const trainingList = trainings();
    const failedTrainings = trainingList.filter(t => t.status === "failed").length;
    const runningTrainings = trainingList.filter(t => t.status === "running").length;

    if (failedTrainings > 0) {
      return "critical";
    }
    if (runningTrainings > 0) {
      return "healthy";
    }
    return "idle";
  };

  // Get health icon
  const getHealthIcon = () => {
    const health = getSystemHealth();
    switch (health) {
      case "healthy":
        return fluentIconsPackage.getIcon("play-circle");
      case "critical":
        return fluentIconsPackage.getIcon("dismiss-circle");
      case "idle":
        return fluentIconsPackage.getIcon("pause-circle");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  // Get health class
  const getHealthClass = () => {
    const health = getSystemHealth();
    switch (health) {
      case "healthy":
        return "health-healthy";
      case "critical":
        return "health-critical";
      case "idle":
        return "health-idle";
      default:
        return "health-unknown";
    }
  };

  // Get health message
  const getHealthMessage = () => {
    const health = getSystemHealth();
    const trainingList = trainings();
    const runningCount = trainingList.filter(t => t.status === "running").length;
    const failedCount = trainingList.filter(t => t.status === "failed").length;

    switch (health) {
      case "healthy":
        return `${runningCount} training${runningCount !== 1 ? "s" : ""} running`;
      case "critical":
        return `${failedCount} training${failedCount !== 1 ? "s" : ""} failed`;
      case "idle":
        return "No active trainings";
      default:
        return "System status unknown";
    }
  };

  // Tabs configuration
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div class="overview-tab">
          <div class="overview-grid">
            {/* Training Summary */}
            <div class="overview-card">
              <h3>Training Status</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{trainings().length}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value success">{trainings().filter(t => t.status === "running").length}</span>
                  <span class="stat-label">Running</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value warning">{trainings().filter(t => t.status === "completed").length}</span>
                  <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value error">{trainings().filter(t => t.status === "failed").length}</span>
                  <span class="stat-label">Failed</span>
                </div>
              </div>
            </div>

            {/* Resource Monitor */}
            <div class="overview-card">
              <h3>Resource Usage</h3>
              <ResourceMonitor
                compact
                data={{
                  gpu: {
                    utilization: 85,
                    memory_used: 8.5 * 1024 * 1024 * 1024,
                    memory_total: 12 * 1024 * 1024 * 1024,
                    temperature: 72,
                  },
                  cpu: {
                    utilization: 65,
                    memory_used: 16 * 1024 * 1024 * 1024,
                    memory_total: 32 * 1024 * 1024 * 1024,
                  },
                  system: {
                    disk_usage: 45,
                  },
                }}
              />
            </div>

            {/* Quick Actions */}
            <div class="overview-card">
              <h3>Quick Actions</h3>
              <div class="quick-actions">
                <Button variant="primary" size="sm" onClick={() => setActiveTab("training")}>
                  View Trainings
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("config")}>
                  Configure Training
                </Button>
                <Show when={props.showChromaWizard}>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab("chroma")}>
                    Chroma Wizard
                  </Button>
                </Show>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "training",
      label: "Training",
      content: (
        <div class="training-tab">
          <div class="training-list">
            {trainings().map(training => (
              <TrainingCard
                training={training}
                onSelect={(id: string) => {
                  // Show training details
                }}
                onStop={handleTrainingStop}
                onResume={(id: string) => {
                  // Resume training
                }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "config",
      label: "Configuration",
      content: (
        <div class="config-tab">
          <ConfigBuilder
            onConfigChange={(config) => {
              console.log("Configuration changed:", config);
            }}
            onConfigSave={(config) => {
              console.log("Configuration saved:", config);
            }}
          />
        </div>
      ),
    },
    {
      id: "chroma",
      label: "Chroma Training",
      content: (
        <div class="chroma-tab">
          <div class="chroma-placeholder">
            <h3>Chroma Training Wizard</h3>
            <p>Chroma-specific training interface coming soon...</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div class="diffusion-pipe-dashboard">
      {/* Header */}
      <div class="dashboard-header">
        <div class="dashboard-title">
          <h2>{props.title || "Diffusion-Pipe Training Dashboard"}</h2>
          <div class={`system-health ${getHealthClass()}`}>
            <span class="health-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={getHealthIcon()?.outerHTML || ""}
              />
            </span>
            <span class="health-message">{getHealthMessage()}</span>
          </div>
        </div>

        <div class="dashboard-actions">
          <Button variant="primary" onClick={refreshAll} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner" />
              Refreshing...
            </Show>
          </Button>

          <Show when={lastRefresh()}>
            <div class="last-refresh">Last updated: {lastRefresh()!.toLocaleTimeString()}</div>
          </Show>
        </div>
      </div>

      {/* Error Display */}
      <Show when={error()}>
        <div class="error-banner">
          <span class="error-icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("warning")?.outerHTML || ""}
            />
          </span>
          <span class="error-message">{error()}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      </Show>

      {/* Tabs */}
      <Tabs items={tabs} activeTab={activeTab()} onTabChange={setActiveTab} variant="underline" size="lg" />
    </div>
  );
};

export default DiffusionPipeDashboard;
