/**
 * ServiceStatusPanel Component
 * Detailed service status panel with actions, progress, dependencies, and metrics
 */

import { Component, For, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Button } from "../primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ServiceHealthIndicator } from "./ServiceHealthIndicator";
import { ServiceLoadingProgress } from "./ServiceLoadingProgress";
import { ServiceDependencyGraph } from "./ServiceDependencyGraph";

export interface ServiceStatusPanelProps {
  /** Whether to show detailed service information */
  showDetails?: boolean;
  /** Whether to show service action buttons */
  showActions?: boolean;
  /** Whether to show loading progress */
  showProgress?: boolean;
  /** Whether to show dependency graph */
  showDependencies?: boolean;
  /** Whether to show performance metrics */
  showMetrics?: boolean;
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface ServiceStatus {
  name: string;
  status: "running" | "stopped" | "starting" | "stopping" | "failed";
  health: "healthy" | "degraded" | "unhealthy" | "unknown";
  isHealthy: boolean;
  message?: string;
  lastCheck?: Date;
  uptime?: number;
  startupTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  connection_state?: string;
}

export interface ServiceSummary {
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  failedServices: number;
  successRate?: number;
}

export const ServiceStatusPanel: Component<ServiceStatusPanelProps> = props => {
  const [selectedService, setSelectedService] = createSignal<string | null>(null);
  const [showMetrics, setShowMetrics] = createSignal(false);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [services, setServices] = createSignal<Record<string, ServiceStatus>>({});
  const [summary, setSummary] = createSignal<ServiceSummary>({
    totalServices: 0,
    runningServices: 0,
    healthyServices: 0,
    failedServices: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);

  // Auto-refresh functionality
  let refreshInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    // Initial data load
    refreshServiceData();
  });

  onCleanup(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  createEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    if (props.refreshInterval && props.refreshInterval > 0) {
      refreshInterval = setInterval(() => {
        refreshServiceData();
      }, props.refreshInterval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  // Refresh service data
  const refreshServiceData = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API calls to backend health endpoints
      const mockServices: Record<string, ServiceStatus> = {
        "caption-service": {
          name: "caption-service",
          status: "running",
          health: "healthy",
          isHealthy: true,
          message: "Service is running normally",
          lastCheck: new Date(),
          uptime: 3600,
          startupTime: 1200,
          memoryUsage: 256 * 1024 * 1024,
          cpuUsage: 15.5,
        },
        "nlweb-service": {
          name: "nlweb-service",
          status: "running",
          health: "healthy",
          isHealthy: true,
          message: "Service is running normally",
          lastCheck: new Date(),
          uptime: 3600,
          startupTime: 800,
          memoryUsage: 128 * 1024 * 1024,
          cpuUsage: 8.2,
        },
        "summarization-service": {
          name: "summarization-service",
          status: "running",
          health: "degraded",
          isHealthy: false,
          message: "Service is running with reduced functionality",
          lastCheck: new Date(),
          uptime: 3600,
          startupTime: 2000,
          memoryUsage: 512 * 1024 * 1024,
          cpuUsage: 45.8,
        },
        "ollama-service": {
          name: "ollama-service",
          status: "running",
          health: "healthy",
          isHealthy: true,
          message: "Service is running normally",
          lastCheck: new Date(),
          uptime: 3600,
          startupTime: 3000,
          memoryUsage: 1024 * 1024 * 1024,
          cpuUsage: 25.3,
        },
        "diffusion-service": {
          name: "diffusion-service",
          status: "running",
          health: "healthy",
          isHealthy: true,
          message: "Service is running normally",
          lastCheck: new Date(),
          uptime: 3600,
          startupTime: 1500,
          memoryUsage: 768 * 1024 * 1024,
          cpuUsage: 35.7,
        },
        "tts-service": {
          name: "tts-service",
          status: "running",
          health: "healthy",
          isHealthy: true,
          message: "Service is running normally",
          lastCheck: new Date(),
          uptime: 3600,
          startupTime: 1000,
          memoryUsage: 192 * 1024 * 1024,
          cpuUsage: 12.1,
        },
        "embedding-visualization": {
          name: "embedding-visualization",
          status: "running",
          health: "healthy",
          isHealthy: true,
          message: "Service is running normally",
          lastCheck: new Date(),
          uptime: 3600,
          startupTime: 900,
          memoryUsage: 320 * 1024 * 1024,
          cpuUsage: 18.9,
        },
        "comfy-service": {
          name: "comfy-service",
          status: "failed",
          health: "unhealthy",
          isHealthy: false,
          message: "Service failed to start",
          lastCheck: new Date(),
          uptime: 0,
          startupTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
        },
      };

      setServices(mockServices);

      // Calculate summary
      const serviceList = Object.values(mockServices);
      const mockSummary: ServiceSummary = {
        totalServices: serviceList.length,
        runningServices: serviceList.filter(s => s.status === "running").length,
        healthyServices: serviceList.filter(s => s.health === "healthy").length,
        failedServices: serviceList.filter(s => s.status === "failed").length,
        successRate: (serviceList.filter(s => s.status === "running").length / serviceList.length) * 100,
      };

      setSummary(mockSummary);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service data");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshServiceData();
  };

  const handleRestartService = async (serviceName: string) => {
    // In a real implementation, this would call the backend restart endpoint
    console.log(`Restarting service: ${serviceName}`);

    // Simulate restart
    const updatedServices = { ...services() };
    if (updatedServices[serviceName]) {
      updatedServices[serviceName] = {
        ...updatedServices[serviceName],
        status: "starting",
        health: "unknown",
        isHealthy: false,
        message: "Service is restarting...",
      };
      setServices(updatedServices);

      // Simulate restart completion after 3 seconds
      setTimeout(() => {
        const finalServices = { ...services() };
        if (finalServices[serviceName]) {
          finalServices[serviceName] = {
            ...finalServices[serviceName],
            status: "running",
            health: "healthy",
            isHealthy: true,
            message: "Service restarted successfully",
            lastCheck: new Date(),
          };
          setServices(finalServices);
        }
      }, 3000);
    }
  };

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(selectedService() === serviceName ? null : serviceName);
  };

  const formatUptime = (uptime?: number): string => {
    if (!uptime) return "N/A";

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatMemoryUsage = (memoryUsage?: number): string => {
    if (!memoryUsage) return "N/A";

    if (memoryUsage > 1024 * 1024 * 1024) {
      return `${(memoryUsage / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (memoryUsage > 1024 * 1024) {
      return `${(memoryUsage / (1024 * 1024)).toFixed(1)} MB`;
    } else if (memoryUsage > 1024) {
      return `${(memoryUsage / 1024).toFixed(1)} KB`;
    } else {
      return `${memoryUsage} B`;
    }
  };

  const getStatusIcon = (service: ServiceStatus) => {
    if (service.status === "failed") return "dismiss-circle";
    if (service.status === "running" && service.isHealthy) return "checkmark-circle";
    if (service.status === "running" && !service.isHealthy) return "warning";
    if (service.status === "starting") return "spinner";
    if (service.status === "stopping") return "warning";
    return "info";
  };

  const getStatusColor = (service: ServiceStatus) => {
    if (service.status === "failed") return "error";
    if (service.status === "running" && service.isHealthy) return "success";
    if (service.status === "running" && !service.isHealthy) return "warning";
    if (service.status === "starting") return "info";
    if (service.status === "stopping") return "warning";
    return "neutral";
  };

  return (
    <div class="service-status-panel">
      {/* Header */}
      <div class="service-status-header">
        <div class="service-status-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("server")?.outerHTML || ""}
            />
          </span>
          <h3>Service Status</h3>
        </div>

        <div class="service-status-actions">
          <Show when={props.showProgress && isLoading()}>
            <ServiceLoadingProgress />
          </Show>

          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner" />
              Refreshing...
            </Show>
          </Button>

          <Show when={props.showMetrics}>
            <Button variant="secondary" size="sm" onClick={() => setShowMetrics(!showMetrics())}>
              {showMetrics() ? "Hide Metrics" : "Show Metrics"}
            </Button>
          </Show>
        </div>
      </div>

      {/* Summary */}
      <div class="service-summary">
        <div class="summary-item">
          <span class="label">Total:</span>
          <span class="value">{summary().totalServices}</span>
        </div>
        <div class="summary-item">
          <span class="label">Running:</span>
          <span class="value success">{summary().runningServices}</span>
        </div>
        <div class="summary-item">
          <span class="label">Healthy:</span>
          <span class="value success">{summary().healthyServices}</span>
        </div>
        <div class="summary-item">
          <span class="label">Failed:</span>
          <span class="value error">{summary().failedServices}</span>
        </div>
        <div class="summary-item">
          <span class="label">Success Rate:</span>
          <span class="value">{(summary().successRate ?? 0).toFixed(1)}%</span>
        </div>
      </div>

      {/* Error Display */}
      <Show when={error()}>
        <div class="service-error">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("error")?.outerHTML || ""}
            />
          </span>
          <span class="error-message">{error()}</span>
        </div>
      </Show>

      {/* Services List */}
      <div class="services-list">
        <For each={Object.entries(services())}>
          {([serviceName, service]) => (
            <div
              class="service-item"
              classList={{
                selected: selectedService() === serviceName,
                [getStatusColor(service)]: true,
              }}
              onClick={() => handleServiceClick(serviceName)}
            >
              <div class="service-header">
                <div class="service-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon(getStatusIcon(service))?.outerHTML || ""}
                    />
                  </span>
                  <span class="service-name">{serviceName}</span>
                  <ServiceHealthIndicator health={service.health} />
                  <Show when={service.connection_state}>
                    <span class="connection-state-badge" classList={{ [String(service.connection_state)]: true }}>
                      {service.connection_state}
                    </span>
                  </Show>
                </div>

                <div class="service-status">
                  <span class="status-badge" classList={{ [service.status]: true }}>
                    {service.status}
                  </span>

                  <Show when={props.showActions && service.status === "running"}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleRestartService(serviceName);
                      }}
                    >
                      Restart
                    </Button>
                  </Show>
                </div>
              </div>

              {/* Service Details */}
              <Show when={props.showDetails && selectedService() === serviceName}>
                <div class="service-details">
                  <Show when={service.message}>
                    <div class="detail-item">
                      <span class="label">Message:</span>
                      <span class="value">{service.message}</span>
                    </div>
                  </Show>

                  <Show when={service.lastCheck}>
                    <div class="detail-item">
                      <span class="label">Last Check:</span>
                      <span class="value">{service.lastCheck!.toLocaleString()}</span>
                    </div>
                  </Show>

                  <Show when={service.uptime !== undefined}>
                    <div class="detail-item">
                      <span class="label">Uptime:</span>
                      <span class="value">{formatUptime(service.uptime)}</span>
                    </div>
                  </Show>

                  <Show when={service.startupTime !== undefined}>
                    <div class="detail-item">
                      <span class="label">Startup Time:</span>
                      <span class="value">{service.startupTime}ms</span>
                    </div>
                  </Show>

                  <Show when={showMetrics()}>
                    <Show when={service.memoryUsage !== undefined}>
                      <div class="detail-item">
                        <span class="label">Memory:</span>
                        <span class="value">{formatMemoryUsage(service.memoryUsage)}</span>
                      </div>
                    </Show>

                    <Show when={service.cpuUsage !== undefined}>
                      <div class="detail-item">
                        <span class="label">CPU:</span>
                        <span class="value">{service.cpuUsage?.toFixed(1)}%</span>
                      </div>
                    </Show>
                  </Show>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>

      {/* Loading State */}
      <Show when={isLoading()}>
        <div class="service-loading">
          <span class="icon spin">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("spinner")?.outerHTML || ""}
            />
          </span>
          <span>Loading service status...</span>
        </div>
      </Show>

      {/* Dependency Graph */}
      <Show when={props.showDependencies && selectedService()}>
        <ServiceDependencyGraph serviceName={selectedService()!} />
      </Show>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">Last updated: {lastUpdate()!.toLocaleString()}</div>
      </Show>
    </div>
  );
};
