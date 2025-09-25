/**
 * 🦊 Resource Monitor Component
 *
 * GPU/CPU usage visualization with alerts
 * following Reynard's monitoring component patterns.
 */

import { Show, createSignal, createEffect, Component, onMount, onCleanup } from "solid-js";
import { Card } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { Badge } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { RealTimeChart } from "reynard-charts";
import { useTrainingWebSocket } from '../hooks/useTrainingWebSocket';

export interface ResourceData {
  gpu: {
    utilization: number; // 0-100
    memory_used: number; // bytes
    memory_total: number; // bytes
    temperature: number; // celsius
    power_usage?: number; // watts
    fan_speed?: number; // percentage
  };
  cpu: {
    utilization: number; // 0-100
    memory_used: number; // bytes
    memory_total: number; // bytes
    temperature?: number; // celsius
    cores?: number;
  };
  system: {
    disk_usage: number; // 0-100
    network_usage?: number; // bytes per second
    load_average?: number[];
  };
}

export interface ResourceMonitorProps {
  data?: ResourceData;
  trainingId?: string;
  websocketUrl?: string;
  compact?: boolean;
  showAlerts?: boolean;
  refreshInterval?: number;
  onAlert?: (alert: ResourceAlert) => void;
  showCharts?: boolean;
}

export interface ResourceAlert {
  type: "warning" | "error" | "info";
  resource: "gpu" | "cpu" | "system";
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

export const ResourceMonitor: Component<ResourceMonitorProps> = props => {
  const [alerts, setAlerts] = createSignal<ResourceAlert[]>([]);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [resourceData, setResourceData] = createSignal<ResourceData>(props.data || {
    gpu: {
      utilization: 0,
      memory_used: 0,
      memory_total: 0,
      temperature: 0,
      power_usage: 0,
    },
    cpu: {
      utilization: 0,
      memory_used: 0,
      memory_total: 0,
      temperature: 0,
      cores: 0,
    },
    system: {
      disk_usage: 0,
      network_usage: 0,
      load_average: [0, 0, 0],
    },
  });
  
  // Real-time chart data
  const [gpuUtilizationData, setGpuUtilizationData] = createSignal<Array<{timestamp: number, value: number, label: string}>>([]);
  const [gpuMemoryData, setGpuMemoryData] = createSignal<Array<{timestamp: number, value: number, label: string}>>([]);
  const [cpuUsageData, setCpuUsageData] = createSignal<Array<{timestamp: number, value: number, label: string}>>([]);

  // WebSocket integration for real-time resource monitoring
  const websocket = props.websocketUrl && props.trainingId ? useTrainingWebSocket({
    url: props.websocketUrl,
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
  }) : null;

  // Handle WebSocket events for real-time resource monitoring
  createEffect(() => {
    if (websocket) {
      const events = websocket.events();
      events.forEach(event => {
        if (event.type === "metrics" && event.trainingId === props.trainingId) {
          const metrics = event.data;
          const timestamp = event.timestamp.getTime();
          
          // Update resource data
          setResourceData(prev => ({
            ...prev,
            gpu: {
              utilization: metrics.gpu_utilization || prev.gpu.utilization,
              memory_used: metrics.gpu_memory_used || prev.gpu.memory_used,
              memory_total: metrics.gpu_memory_total || prev.gpu.memory_total,
              temperature: metrics.gpu_temperature || prev.gpu.temperature,
              power_usage: metrics.gpu_power_usage || prev.gpu.power_usage,
            },
            cpu: {
              utilization: metrics.cpu_usage || prev.cpu.utilization,
              memory_used: metrics.cpu_memory_used || prev.cpu.memory_used,
              memory_total: metrics.cpu_memory_total || prev.cpu.memory_total,
              temperature: metrics.cpu_temperature || prev.cpu.temperature,
              cores: metrics.cpu_cores || prev.cpu.cores,
            },
            system: {
              disk_usage: metrics.disk_usage || prev.system.disk_usage,
              network_usage: metrics.network_usage || prev.system.network_usage,
              load_average: metrics.load_average || prev.system.load_average,
            },
          }));

          // Update chart data
          setGpuUtilizationData(prev => [...prev.slice(-99), {
            timestamp,
            value: metrics.gpu_utilization || 0,
            label: "GPU Utilization"
          }]);
          
          setGpuMemoryData(prev => [...prev.slice(-99), {
            timestamp,
            value: metrics.gpu_memory_used || 0,
            label: "GPU Memory"
          }]);
          
          setCpuUsageData(prev => [...prev.slice(-99), {
            timestamp,
            value: metrics.cpu_usage || 0,
            label: "CPU Usage"
          }]);
        }
      });
    }
  });

  // Subscribe to training metrics via WebSocket
  onMount(() => {
    if (websocket && props.trainingId) {
      websocket.subscribe(props.trainingId);
    }
  });

  onCleanup(() => {
    if (websocket && props.trainingId) {
      websocket.unsubscribe(props.trainingId);
    }
  });

  // Check for resource alerts
  createEffect(() => {
    const newAlerts: ResourceAlert[] = [];
    const data = resourceData();

    // GPU alerts
    if (data.gpu.utilization > 95) {
      newAlerts.push({
        type: "error",
        resource: "gpu",
        metric: "utilization",
        value: data.gpu.utilization,
        threshold: 95,
        message: "GPU utilization critically high",
      });
    } else if (data.gpu.utilization > 85) {
      newAlerts.push({
        type: "warning",
        resource: "gpu",
        metric: "utilization",
        value: data.gpu.utilization,
        threshold: 85,
        message: "GPU utilization high",
      });
    }

    if (data.gpu.memory_used / data.gpu.memory_total > 0.95) {
      newAlerts.push({
        type: "error",
        resource: "gpu",
        metric: "memory",
        value: (data.gpu.memory_used / data.gpu.memory_total) * 100,
        threshold: 95,
        message: "GPU memory critically high",
      });
    } else if (data.gpu.memory_used / data.gpu.memory_total > 0.85) {
      newAlerts.push({
        type: "warning",
        resource: "gpu",
        metric: "memory",
        value: (data.gpu.memory_used / data.gpu.memory_total) * 100,
        threshold: 85,
        message: "GPU memory high",
      });
    }

    if (data.gpu.temperature > 85) {
      newAlerts.push({
        type: "error",
        resource: "gpu",
        metric: "temperature",
        value: data.gpu.temperature,
        threshold: 85,
        message: "GPU temperature critically high",
      });
    } else if (data.gpu.temperature > 75) {
      newAlerts.push({
        type: "warning",
        resource: "gpu",
        metric: "temperature",
        value: data.gpu.temperature,
        threshold: 75,
        message: "GPU temperature high",
      });
    }

    // CPU alerts
    if (data.cpu.utilization > 95) {
      newAlerts.push({
        type: "error",
        resource: "cpu",
        metric: "utilization",
        value: data.cpu.utilization,
        threshold: 95,
        message: "CPU utilization critically high",
      });
    } else if (data.cpu.utilization > 85) {
      newAlerts.push({
        type: "warning",
        resource: "cpu",
        metric: "utilization",
        value: data.cpu.utilization,
        threshold: 85,
        message: "CPU utilization high",
      });
    }

    if (data.cpu.memory_used / data.cpu.memory_total > 0.95) {
      newAlerts.push({
        type: "error",
        resource: "cpu",
        metric: "memory",
        value: (data.cpu.memory_used / data.cpu.memory_total) * 100,
        threshold: 95,
        message: "System memory critically high",
      });
    } else if (data.cpu.memory_used / data.cpu.memory_total > 0.85) {
      newAlerts.push({
        type: "warning",
        resource: "cpu",
        metric: "memory",
        value: (data.cpu.memory_used / data.cpu.memory_total) * 100,
        threshold: 85,
        message: "System memory high",
      });
    }

    // System alerts
    if (data.system.disk_usage > 95) {
      newAlerts.push({
        type: "error",
        resource: "system",
        metric: "disk",
        value: data.system.disk_usage,
        threshold: 95,
        message: "Disk usage critically high",
      });
    } else if (data.system.disk_usage > 85) {
      newAlerts.push({
        type: "warning",
        resource: "system",
        metric: "disk",
        value: data.system.disk_usage,
        threshold: 85,
        message: "Disk usage high",
      });
    }

    setAlerts(newAlerts);

    // Notify parent component of alerts
    if (props.onAlert && newAlerts.length > 0) {
      newAlerts.forEach(alert => props.onAlert!(alert));
    }
  });

  // Format memory size
  const formatMemory = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  // Get utilization color
  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return "error";
    if (utilization > 75) return "warning";
    if (utilization > 50) return "info";
    return "success";
  };

  // Get alert icon
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return fluentIconsPackage.getIcon("dismiss-circle");
      case "warning":
        return fluentIconsPackage.getIcon("warning");
      case "info":
        return fluentIconsPackage.getIcon("info");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  // Get resource icon
  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "gpu":
        return fluentIconsPackage.getIcon("gpu");
      case "cpu":
        return fluentIconsPackage.getIcon("cpu");
      case "system":
        return fluentIconsPackage.getIcon("hard-drive");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  return (
    <Card class={`resource-monitor ${props.compact ? "compact" : ""}`}>
      <div class="monitor-header">
        <div class="monitor-title">
          <h3>Resource Monitor</h3>
          <Show when={alerts().length > 0}>
            <Badge variant="destructive">
              {alerts().length} Alert{alerts().length !== 1 ? "s" : ""}
            </Badge>
          </Show>
        </div>

        <div class="monitor-actions">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <Show when={props.showAlerts && alerts().length > 0}>
        <div class="monitor-alerts">
          {alerts().map(alert => (
            <div class={`alert alert-${alert.type}`}>
              <span class="alert-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={getAlertIcon(alert.type)?.outerHTML || ""}
                />
              </span>
              <span class="alert-message">{alert.message}</span>
              <span class="alert-value">{alert.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </Show>

      <div class="monitor-content">
        {/* GPU Resources */}
        <div class="resource-section">
          <div class="resource-header">
            <span class="resource-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={getResourceIcon("gpu")?.outerHTML || ""}
              />
            </span>
            <span class="resource-title">GPU</span>
          </div>

          <div class="resource-metrics">
            <div class="metric-item">
              <span class="metric-label">Utilization</span>
              <div class="metric-bar">
                <div
                  class="metric-fill"
                  style={{
                    width: `${resourceData().gpu.utilization}%`,
                    "background-color": `var(--color-${getUtilizationColor(resourceData().gpu.utilization)})`,
                  }}
                />
              </div>
              <span class="metric-value">{resourceData().gpu.utilization.toFixed(1)}%</span>
            </div>

            <div class="metric-item">
              <span class="metric-label">Memory</span>
              <div class="metric-bar">
                <div
                  class="metric-fill"
                  style={{
                    width: `${(resourceData().gpu.memory_used / resourceData().gpu.memory_total) * 100}%`,
                    "background-color": `var(--color-${getUtilizationColor((resourceData().gpu.memory_used / resourceData().gpu.memory_total) * 100)})`,
                  }}
                />
              </div>
              <span class="metric-value">
                {formatMemory(resourceData().gpu.memory_used)} / {formatMemory(resourceData().gpu.memory_total)}
              </span>
            </div>

            <div class="metric-item">
              <span class="metric-label">Temperature</span>
              <span class="metric-value">{resourceData().gpu.temperature.toFixed(1)}°C</span>
            </div>

            <Show when={resourceData().gpu.power_usage}>
              <div class="metric-item">
                <span class="metric-label">Power</span>
                <span class="metric-value">{resourceData().gpu.power_usage!.toFixed(1)}W</span>
              </div>
            </Show>
          </div>
        </div>

        {/* CPU Resources */}
        <div class="resource-section">
          <div class="resource-header">
            <span class="resource-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={getResourceIcon("cpu")?.outerHTML || ""}
              />
            </span>
            <span class="resource-title">CPU</span>
          </div>

          <div class="resource-metrics">
            <div class="metric-item">
              <span class="metric-label">Utilization</span>
              <div class="metric-bar">
                <div
                  class="metric-fill"
                  style={{
                    width: `${resourceData().cpu.utilization}%`,
                    "background-color": `var(--color-${getUtilizationColor(resourceData().cpu.utilization)})`,
                  }}
                />
              </div>
              <span class="metric-value">{resourceData().cpu.utilization.toFixed(1)}%</span>
            </div>

            <div class="metric-item">
              <span class="metric-label">Memory</span>
              <div class="metric-bar">
                <div
                  class="metric-fill"
                  style={{
                    width: `${(resourceData().cpu.memory_used / resourceData().cpu.memory_total) * 100}%`,
                    "background-color": `var(--color-${getUtilizationColor((resourceData().cpu.memory_used / resourceData().cpu.memory_total) * 100)})`,
                  }}
                />
              </div>
              <span class="metric-value">
                {formatMemory(resourceData().cpu.memory_used)} / {formatMemory(resourceData().cpu.memory_total)}
              </span>
            </div>

            <Show when={resourceData().cpu.temperature}>
              <div class="metric-item">
                <span class="metric-label">Temperature</span>
                <span class="metric-value">{resourceData().cpu.temperature!.toFixed(1)}°C</span>
              </div>
            </Show>

            <Show when={resourceData().cpu.cores}>
              <div class="metric-item">
                <span class="metric-label">Cores</span>
                <span class="metric-value">{resourceData().cpu.cores}</span>
              </div>
            </Show>
          </div>
        </div>

        <Show when={isExpanded()}>
          {/* System Resources */}
          <div class="resource-section">
            <div class="resource-header">
              <span class="resource-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={getResourceIcon("system")?.outerHTML || ""}
                />
              </span>
              <span class="resource-title">System</span>
            </div>

            <div class="resource-metrics">
              <div class="metric-item">
                <span class="metric-label">Disk Usage</span>
                <div class="metric-bar">
                  <div
                    class="metric-fill"
                    style={{
                      width: `${resourceData().system.disk_usage}%`,
                      "background-color": `var(--color-${getUtilizationColor(resourceData().system.disk_usage)})`,
                    }}
                  />
                </div>
                <span class="metric-value">{resourceData().system.disk_usage.toFixed(1)}%</span>
              </div>

              <Show when={resourceData().system.network_usage}>
                <div class="metric-item">
                  <span class="metric-label">Network</span>
                  <span class="metric-value">{formatMemory(resourceData().system.network_usage!)}/s</span>
                </div>
              </Show>

              <Show when={resourceData().system.load_average}>
                <div class="metric-item">
                  <span class="metric-label">Load Average</span>
                  <span class="metric-value">
                    {resourceData().system.load_average!.map((l: number) => l.toFixed(2)).join(", ")}
                  </span>
                </div>
              </Show>
            </div>
          </div>
        </Show>

        {/* Real-time Charts */}
        <Show when={props.showCharts && isExpanded()}>
          <div class="resource-charts">
            <div class="chart-section">
              <h4>GPU Utilization</h4>
              <RealTimeChart
                type="line"
                data={gpuUtilizationData()}
                maxDataPoints={100}
                timeRange={300000} // 5 minutes
                height={200}
                title="GPU Utilization Over Time"
                yAxisLabel="Utilization (%)"
                valueFormatter={(value) => `${value.toFixed(1)}%`}
              />
            </div>

            <div class="chart-section">
              <h4>GPU Memory Usage</h4>
              <RealTimeChart
                type="line"
                data={gpuMemoryData()}
                maxDataPoints={100}
                timeRange={300000} // 5 minutes
                height={200}
                title="GPU Memory Usage Over Time"
                yAxisLabel="Memory (GB)"
                valueFormatter={(value) => `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`}
              />
            </div>

            <div class="chart-section">
              <h4>CPU Usage</h4>
              <RealTimeChart
                type="line"
                data={cpuUsageData()}
                maxDataPoints={100}
                timeRange={300000} // 5 minutes
                height={200}
                title="CPU Usage Over Time"
                yAxisLabel="Usage (%)"
                valueFormatter={(value) => `${value.toFixed(1)}%`}
              />
            </div>
          </div>
        </Show>
      </div>
    </Card>
  );
};

export default ResourceMonitor;
