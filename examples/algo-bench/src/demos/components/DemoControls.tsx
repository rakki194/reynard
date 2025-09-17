import { Component } from "solid-js";
import { Slider } from "reynard-components";

interface DemoControlsProps {
  objectCount: number;
  isRunning: boolean;
  onObjectCountChange: (count: number) => void;
  onToggleRunning: () => void;
  onReset: () => void;
}

/**
 * Demo controls component for managing simulation parameters
 */
export const DemoControls: Component<DemoControlsProps> = props => {
  return (
    <div class="demo-controls">
      <div class="control-group">
        <label for="object-count-slider">Object Count: {props.objectCount}</label>
        <Slider
          id="object-count-slider"
          min={5}
          max={100}
          value={props.objectCount}
          onChange={e => props.onObjectCountChange(parseInt(e.currentTarget.value))}
          title="Adjust the number of objects in the simulation"
        />
      </div>

      <div class="control-group">
        <button class={`control-button ${props.isRunning ? "active" : ""}`} onClick={props.onToggleRunning}>
          {props.isRunning ? "⏸️ Pause" : "▶️ Start"}
        </button>

        <button class="control-button" onClick={props.onReset}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};
