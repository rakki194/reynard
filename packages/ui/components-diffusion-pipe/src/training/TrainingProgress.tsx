/**
 * 🦊 Training Progress Component
 *
 * Real-time progress visualization with streaming support
 * following Reynard's progress component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface TrainingProgressProps {
  progress: number; // 0-100
  currentEpoch: number;
  totalEpochs: number;
  status: "running" | "completed" | "failed" | "paused" | "queued";
  compact?: boolean;
  showEta?: boolean;
  showSpeed?: boolean;
  estimatedTimeRemaining?: number; // in seconds
  currentSpeed?: number; // epochs per second
}

export const TrainingProgress: Component<TrainingProgressProps> = props => {
  const [animatedProgress, setAnimatedProgress] = createSignal(0);

  // Animate progress changes
  createEffect(() => {
    const targetProgress = props.progress;
    const currentProgress = animatedProgress();

    if (Math.abs(targetProgress - currentProgress) > 0.1) {
      const step = (targetProgress - currentProgress) / 10;
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          const newProgress = prev + step;
          if (Math.abs(newProgress - targetProgress) < 0.1) {
            clearInterval(interval);
            return targetProgress;
          }
          return newProgress;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  });

  // Get progress color based on status
  const getProgressColor = () => {
    switch (props.status) {
      case "running":
        return "var(--color-success)";
      case "completed":
        return "var(--color-info)";
      case "failed":
        return "var(--color-error)";
      case "paused":
        return "var(--color-warning)";
      case "queued":
        return "var(--color-secondary)";
      default:
        return "var(--color-secondary)";
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (props.status) {
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

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Calculate ETA
  const calculateEta = () => {
    if (props.estimatedTimeRemaining) {
      return formatTimeRemaining(props.estimatedTimeRemaining);
    }

    if (props.currentSpeed && props.currentSpeed > 0) {
      const remainingEpochs = props.totalEpochs - props.currentEpoch;
      const estimatedSeconds = remainingEpochs / props.currentSpeed;
      return formatTimeRemaining(estimatedSeconds);
    }

    return null;
  };

  const eta = calculateEta();

  return (
    <div class={`training-progress ${props.compact ? "compact" : ""}`}>
      <div class="progress-header">
        <div class="progress-info">
          <span class="progress-percentage">{Math.round(animatedProgress())}%</span>
          <span class="progress-epochs">
            Epoch {props.currentEpoch} of {props.totalEpochs}
          </span>
        </div>

        <Show when={props.showEta && eta}>
          <div class="progress-eta">
            <span class="eta-label">ETA:</span>
            <span class="eta-value">{eta}</span>
          </div>
        </Show>

        <Show when={props.showSpeed && props.currentSpeed}>
          <div class="progress-speed">
            <span class="speed-label">Speed:</span>
            <span class="speed-value">{props.currentSpeed!.toFixed(2)} epochs/s</span>
          </div>
        </Show>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            style={{
              width: `${animatedProgress()}%`,
              "background-color": getProgressColor(),
            }}
          />
        </div>

        <Show when={props.status === "running"}>
          <div class="progress-indicator">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={getStatusIcon()?.outerHTML || ""}
            />
          </div>
        </Show>
      </div>

      <Show when={!props.compact}>
        <div class="progress-details">
          <div class="progress-stats">
            <div class="stat-item">
              <span class="stat-label">Progress:</span>
              <span class="stat-value">{Math.round(animatedProgress())}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Epochs:</span>
              <span class="stat-value">
                {props.currentEpoch}/{props.totalEpochs}
              </span>
            </div>
            <Show when={eta}>
              <div class="stat-item">
                <span class="stat-label">ETA:</span>
                <span class="stat-value">{eta}</span>
              </div>
            </Show>
            <Show when={props.currentSpeed}>
              <div class="stat-item">
                <span class="stat-label">Speed:</span>
                <span class="stat-value">{props.currentSpeed!.toFixed(2)} epochs/s</span>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default TrainingProgress;
