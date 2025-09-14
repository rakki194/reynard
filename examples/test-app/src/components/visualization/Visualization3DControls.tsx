/**
 * 🦊 3D Visualization Controls
 * Control panel for 3D visualization
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";
import { getIcon } from "reynard-fluent-icons";
import type { ProcessedData } from "./DataProcessor";

interface Visualization3DControlsProps {
  isAnimating: () => boolean;
  onStartAnimation: () => void;
  onStopAnimation: () => void;
  onResetCamera: () => void;
  processedData: () => ProcessedData | null;
}

export const Visualization3DControls: Component<
  Visualization3DControlsProps
> = (props) => {
  return (
    <div class="visualization-controls">
      <div class="control-group">
        <Button
          variant={props.isAnimating() ? "danger" : "success"}
          size="sm"
          onClick={
            props.isAnimating() ? props.onStopAnimation : props.onStartAnimation
          }
          leftIcon={getIcon(props.isAnimating() ? "pause" : "play")}
        >
          {props.isAnimating() ? "Stop" : "Animate"}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={props.onResetCamera}
          leftIcon={getIcon("refresh")}
        >
          Reset Camera
        </Button>
      </div>

      <div class="stats-display">
        {props.processedData() && (
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Points:</span>
              <span class="stat-value">
                {props.processedData()!.statistics.count}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Mean:</span>
              <span class="stat-value">
                {props.processedData()!.statistics.mean.toFixed(3)}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Std Dev:</span>
              <span class="stat-value">
                {props.processedData()!.statistics.std.toFixed(3)}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Clusters:</span>
              <span class="stat-value">
                {props.processedData()!.clusters?.length || 0}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
