/**
 * 🦊 Training Card Component
 *
 * Individual training status display with real-time updates
 * following Reynard's card component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { Badge } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { TrainingProgress } from "./TrainingProgress";
import { TrainingMetrics } from "./TrainingMetrics";

export interface TrainingCardProps {
  training: {
    id: string;
    status: "running" | "completed" | "failed" | "paused" | "queued";
    progress: number;
    current_epoch: number;
    total_epochs: number;
    start_time: string;
    end_time?: string;
    model_type: string;
    config: any;
    metrics?: {
      loss: number;
      learning_rate: number;
      gpu_memory: number;
    };
  };
  onSelect?: (id: string) => void;
  onStop?: (id: string) => void;
  onResume?: (id: string) => void;
  onRestart?: (id: string) => void;
  compact?: boolean;
}

export const TrainingCard: Component<TrainingCardProps> = props => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  // Get status color
  const getStatusColor = () => {
    switch (props.training.status) {
      case "running":
        return "secondary";
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "paused":
        return "outline";
      case "queued":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (props.training.status) {
      case "running":
        return fluentIconsPackage.getIcon("play-circle");
      case "completed":
        return fluentIconsPackage.getIcon("checkmark-circle");
      case "failed":
        return fluentIconsPackage.getIcon("dismiss-circle");
      case "paused":
        return fluentIconsPackage.getIcon("pause-circle");
      case "queued":
        return fluentIconsPackage.getIcon("clock");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  // Format duration
  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Handle actions
  const handleStop = async () => {
    if (props.onStop) {
      setIsLoading(true);
      try {
        await props.onStop(props.training.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResume = async () => {
    if (props.onResume) {
      setIsLoading(true);
      try {
        await props.onResume(props.training.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRestart = async () => {
    if (props.onRestart) {
      setIsLoading(true);
      try {
        await props.onRestart(props.training.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card class={`training-card ${props.compact ? "compact" : ""} ${isExpanded() ? "expanded" : ""}`}>
      <div class="training-card-header">
        <div class="training-info">
          <div class="training-title">
            <span class="training-id">Training #{props.training.id}</span>
            <Badge variant={getStatusColor()}>
              <span class="status-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={getStatusIcon()?.outerHTML || ""}
                />
              </span>
              {props.training.status}
            </Badge>
          </div>
          <div class="training-meta">
            <span class="model-type">{props.training.model_type}</span>
            <span class="duration">{formatDuration(props.training.start_time, props.training.end_time)}</span>
            <span class="epochs">
              {props.training.current_epoch}/{props.training.total_epochs} epochs
            </span>
          </div>
        </div>

        <div class="training-actions">
          <Show when={props.training.status === "running"}>
            <Button variant="ghost" size="sm" onClick={handleStop} disabled={isLoading()}>
              Stop
            </Button>
          </Show>
          <Show when={props.training.status === "paused"}>
            <Button variant="ghost" size="sm" onClick={handleResume} disabled={isLoading()}>
              Resume
            </Button>
          </Show>
          <Show when={props.training.status === "failed"}>
            <Button variant="ghost" size="sm" onClick={handleRestart} disabled={isLoading()}>
              Restart
            </Button>
          </Show>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </div>
      </div>

      <div class="training-progress">
        <TrainingProgress
          progress={props.training.progress}
          currentEpoch={props.training.current_epoch}
          totalEpochs={props.training.total_epochs}
          status={props.training.status}
          compact={props.compact}
        />
      </div>

      <Show when={isExpanded()}>
        <div class="training-details">
          <div class="training-metrics">
            <Show when={props.training.metrics}>
              <TrainingMetrics metrics={props.training.metrics!} compact={true} />
            </Show>
          </div>

          <div class="training-config">
            <h4>Configuration</h4>
            <div class="config-grid">
              <div class="config-item">
                <span class="config-label">LoRA Rank:</span>
                <span class="config-value">{props.training.config.rank || "N/A"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Learning Rate:</span>
                <span class="config-value">{props.training.config.lr || "N/A"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Batch Size:</span>
                <span class="config-value">{props.training.config.batch_size || "N/A"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Optimizer:</span>
                <span class="config-value">{props.training.config.optimizer || "N/A"}</span>
              </div>
            </div>
          </div>

          <div class="training-timeline">
            <h4>Timeline</h4>
            <div class="timeline-item">
              <span class="timeline-label">Started:</span>
              <span class="timeline-value">{new Date(props.training.start_time).toLocaleString()}</span>
            </div>
            <Show when={props.training.end_time}>
              <div class="timeline-item">
                <span class="timeline-label">Completed:</span>
                <span class="timeline-value">{new Date(props.training.end_time!).toLocaleString()}</span>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </Card>
  );
};

export default TrainingCard;
