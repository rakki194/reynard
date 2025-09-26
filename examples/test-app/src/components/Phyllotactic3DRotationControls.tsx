/**
 * 🦊 3D Phyllotactic Rotation Controls
 * Rotation controls for 3D phyllotactic system
 */

import { Component } from "solid-js";
import { Card, Button, Slider } from "reynard-primitives";

interface RotationSliderProps {
  label: string;
  value: () => number;
  onChange: (value: number) => void;
}

const RotationSlider: Component<RotationSliderProps> = props => (
  <div class="control-group">
    <label for={`slider-${props.label.toLowerCase().replace(/\s+/g, "-")}`}>
      {props.label}: {props.value().toFixed(3)}
    </label>
    <Slider
      id={`slider-${props.label.toLowerCase().replace(/\s+/g, "-")}`}
      min={-0.05}
      max={0.05}
      step={0.001}
      value={props.value()}
      onChange={props.onChange}
      class="slider"
      aria-label={`${props.label} control`}
    />
  </div>
);

interface Phyllotactic3DRotationControlsProps {
  rotationSpeedX: () => number;
  setRotationSpeedX: (value: number) => void;
  rotationSpeedY: () => number;
  setRotationSpeedY: (value: number) => void;
  rotationSpeedZ: () => number;
  setRotationSpeedZ: (value: number) => void;
  isRunning: () => boolean;
  onConfigUpdate: () => void;
  onRegenerate: () => void;
  onToggleAnimation: () => void;
}

export const Phyllotactic3DRotationControls: Component<Phyllotactic3DRotationControlsProps> = props => {
  const handleSliderChange = (setter: (value: number) => void) => (value: number) => {
    setter(value);
    // Call onConfigUpdate in next tick to avoid reactivity issues
    setTimeout(() => props.onConfigUpdate(), 0);
  };

  return (
    <Card class="rotation-controls">
      <h3>Rotation Controls</h3>

      <RotationSlider
        label="X Rotation"
        value={props.rotationSpeedX}
        onChange={handleSliderChange(props.setRotationSpeedX)}
      />

      <RotationSlider
        label="Y Rotation"
        value={props.rotationSpeedY}
        onChange={handleSliderChange(props.setRotationSpeedY)}
      />

      <RotationSlider
        label="Z Rotation"
        value={props.rotationSpeedZ}
        onChange={handleSliderChange(props.setRotationSpeedZ)}
      />

      <div class="control-group">
        <Button variant="secondary" onClick={props.onRegenerate} class="control-button">
          🔄 Regenerate 3D Pattern
        </Button>
      </div>

      <div class="control-group">
        <Button
          variant={props.isRunning() ? "danger" : "primary"}
          onClick={props.onToggleAnimation}
          class="control-button"
        >
          {props.isRunning() ? "⏹️ Stop Rotation" : "▶️ Start Rotation"}
        </Button>
      </div>
    </Card>
  );
};
