/**
 * 🦊 Training Metrics Component
 *
 * Performance metrics display with charts integration
 * following Reynard's metrics component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-primitives";
import { Badge } from "reynard-primitives";
import { Button } from "reynard-primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface TrainingMetricsProps {
  metrics: {
    loss: number;
    learning_rate: number;
    gpu_memory: number;
    cpu_usage?: number;
    gpu_utilization?: number;
    gpu_temperature?: number;
    throughput?: number; // samples per second
    memory_usage?: number; // system memory
    disk_usage?: number; // disk usage percentage
  };
  compact?: boolean;
  showCharts?: boolean;
  showHistory?: boolean;
  historyData?: Array<{
    timestamp: string;
    loss: number;
    learning_rate: number;
    gpu_memory: number;
  }>;
}

export const TrainingMetrics: Component<TrainingMetricsProps> = props => {
  const [selectedMetric, setSelectedMetric] = createSignal<string | null>(null);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Format metric values
  const formatMetricValue = (value: number, type: string) => {
    switch (type) {
      case "loss":
        return value.toFixed(6);
      case "learning_rate":
        return value.toExponential(2);
      case "gpu_memory":
      case "memory_usage":
        return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
      case "cpu_usage":
      case "gpu_utilization":
      case "disk_usage":
        return `${value.toFixed(1)}%`;
      case "gpu_temperature":
        return `${value.toFixed(1)}°C`;
      case "throughput":
        return `${value.toFixed(2)} samples/s`;
      default:
        return value.toString();
    }
  };

  // Get metric color based on value and type
  const getMetricColor = (value: number, type: string) => {
    switch (type) {
      case "loss":
        return value < 0.1 ? "secondary" : value < 0.5 ? "outline" : "destructive";
      case "gpu_memory":
        return value > 0.9 ? "destructive" : value > 0.7 ? "outline" : "secondary";
      case "cpu_usage":
      case "gpu_utilization":
        return value > 90 ? "destructive" : value > 70 ? "outline" : "secondary";
      case "gpu_temperature":
        return value > 85 ? "destructive" : value > 75 ? "outline" : "secondary";
      case "disk_usage":
        return value > 90 ? "destructive" : value > 80 ? "outline" : "secondary";
      default:
        return "default";
    }
  };

  // Get metric icon
  const getMetricIcon = (type: string) => {
    switch (type) {
      case "loss":
        return fluentIconsPackage.getIcon("chart-line");
      case "learning_rate":
        return fluentIconsPackage.getIcon("speed");
      case "gpu_memory":
        return fluentIconsPackage.getIcon("memory");
      case "cpu_usage":
        return fluentIconsPackage.getIcon("cpu");
      case "gpu_utilization":
        return fluentIconsPackage.getIcon("gpu");
      case "gpu_temperature":
        return fluentIconsPackage.getIcon("thermometer");
      case "throughput":
        return fluentIconsPackage.getIcon("arrow-right");
      case "memory_usage":
        return fluentIconsPackage.getIcon("hard-drive");
      case "disk_usage":
        return fluentIconsPackage.getIcon("storage");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  // Get metric label
  const getMetricLabel = (type: string) => {
    switch (type) {
      case "loss":
        return "Loss";
      case "learning_rate":
        return "Learning Rate";
      case "gpu_memory":
        return "GPU Memory";
      case "cpu_usage":
        return "CPU Usage";
      case "gpu_utilization":
        return "GPU Utilization";
      case "gpu_temperature":
        return "GPU Temperature";
      case "throughput":
        return "Throughput";
      case "memory_usage":
        return "Memory Usage";
      case "disk_usage":
        return "Disk Usage";
      default:
        return type;
    }
  };

  // Get primary metrics (always shown)
  const getPrimaryMetrics = () => {
    return [
      { key: "loss", value: props.metrics.loss },
      { key: "learning_rate", value: props.metrics.learning_rate },
      { key: "gpu_memory", value: props.metrics.gpu_memory },
    ];
  };

  // Get secondary metrics (shown when expanded)
  const getSecondaryMetrics = () => {
    return [
      { key: "cpu_usage", value: props.metrics.cpu_usage },
      { key: "gpu_utilization", value: props.metrics.gpu_utilization },
      { key: "gpu_temperature", value: props.metrics.gpu_temperature },
      { key: "throughput", value: props.metrics.throughput },
      { key: "memory_usage", value: props.metrics.memory_usage },
      { key: "disk_usage", value: props.metrics.disk_usage },
    ].filter(metric => metric.value !== undefined);
  };

  return (
    <Card class={`training-metrics ${props.compact ? "compact" : ""}`}>
      <div class="metrics-header">
        <h3>Training Metrics</h3>
        <Show when={!props.compact}>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </Show>
      </div>

      <div class="metrics-grid">
        {getPrimaryMetrics().map(metric => (
          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={getMetricIcon(metric.key)?.outerHTML || ""}
                />
              </span>
              <span class="metric-label">{getMetricLabel(metric.key)}</span>
            </div>
            <div class="metric-value">
              <Badge variant={getMetricColor(metric.value, metric.key)}>
                {formatMetricValue(metric.value, metric.key)}
              </Badge>
            </div>
          </div>
        ))}

        <Show when={isExpanded()}>
          {getSecondaryMetrics().map(metric => (
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={getMetricIcon(metric.key)?.outerHTML || ""}
                  />
                </span>
                <span class="metric-label">{getMetricLabel(metric.key)}</span>
              </div>
              <div class="metric-value">
                <Badge variant={getMetricColor(metric.value || 0, metric.key)}>
                  {formatMetricValue(metric.value || 0, metric.key)}
                </Badge>
              </div>
            </div>
          ))}
        </Show>
      </div>

      <Show when={props.showCharts && isExpanded()}>
        <div class="metrics-charts">
          <h4>Performance Charts</h4>
          <div class="charts-placeholder">
            {/* Charts would be integrated here using reynard-charts */}
            <p>Charts integration with reynard-charts coming soon...</p>
          </div>
        </div>
      </Show>

      <Show when={props.showHistory && props.historyData && isExpanded()}>
        <div class="metrics-history">
          <h4>Metric History</h4>
          <div class="history-table">
            <div class="history-header">
              <span>Time</span>
              <span>Loss</span>
              <span>LR</span>
              <span>GPU Memory</span>
            </div>
            {props.historyData?.slice(-10).map((dataPoint: any) => (
              <div class="history-row">
                <span>{new Date(dataPoint.timestamp).toLocaleTimeString()}</span>
                <span>{dataPoint.loss.toFixed(6)}</span>
                <span>{dataPoint.learning_rate.toExponential(2)}</span>
                <span>{(dataPoint.gpu_memory / 1024 / 1024 / 1024).toFixed(2)} GB</span>
              </div>
            ))}
          </div>
        </div>
      </Show>
    </Card>
  );
};

export default TrainingMetrics;
