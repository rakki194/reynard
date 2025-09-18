import { Component } from "solid-js";
import { Slider } from "reynard-components";

interface SpatialDemoControlsProps {
  objectCount: number;
  isRunning: boolean;
  onObjectCountChange: (count: number) => void;
  onToggleRunning: () => void;
  onRegenerate: () => void;
}

/**
 * Control panel for spatial optimization demo
 * Provides object count slider and benchmark controls
 */
export const SpatialDemoControls: Component<SpatialDemoControlsProps> = props => {
  return (
    <div class="demo-controls">
      <div class="control-group">
        <label for="spatial-object-count-slider">Object Count: {props.objectCount}</label>
        <Slider
          id="spatial-object-count-slider"
          min={10}
          max={200}
          onChange={value => props.onObjectCountChange(parseInt(value.toString()))}
        />
      </div>

      <div class="control-group">
        <button class={`control-button ${props.isRunning ? "active" : ""}`} onClick={() => props.onToggleRunning()}>
          {props.isRunning ? "⏸️ Pause" : "▶️ Start Benchmark"}
        </button>

        <button class="control-button" onClick={() => props.onRegenerate()}>
          🔄 Regenerate
        </button>
      </div>
    </div>
  );
};
