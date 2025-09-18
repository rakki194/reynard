import { Component } from "solid-js";
import { Slider } from "reynard-components";

export interface PhysicsControlsProps {
  gravity: number;
  damping: number;
  isRunning: boolean;
  onGravityChange: (value: number) => void;
  onDampingChange: (value: number) => void;
  onToggleRunning: () => void;
  onReset: () => void;
}

/**
 * Control panel component for physics simulation parameters
 * Provides sliders for gravity, damping, and control buttons
 */
export const PhysicsControls: Component<PhysicsControlsProps> = props => {
  return (
    <div class="demo-controls">
      <div class="control-group">
        <label for="gravity-slider">Gravity: {props.gravity.toFixed(1)}</label>
        <Slider
          id="gravity-slider"
          min={0}
          max={2}
          step={0.1}
          onChange={value => props.onGravityChange(parseFloat(value.toString()))}
        />
      </div>

      <div class="control-group">
        <label for="damping-slider">Damping: {props.damping.toFixed(2)}</label>
        <Slider
          id="damping-slider"
          min={0.9}
          max={1}
          step={0.01}
          onChange={value => props.onDampingChange(parseFloat(value.toString()))}
        />
      </div>

      <div class="control-group">
        <button class={`control-button ${props.isRunning ? "active" : ""}`} onClick={() => props.onToggleRunning()}>
          {props.isRunning ? "⏸️ Pause" : "▶️ Start"}
        </button>

        <button class="control-button" onClick={() => props.onReset()}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};
