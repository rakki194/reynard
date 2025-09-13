import { Component } from "solid-js";
import { Slider } from "reynard-components";
import "./HueShiftControls.css";

interface HueShiftControlsProps {
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  rampStops: number;
  onRampStopsChange: (stops: number) => void;
}

export const HueShiftControls: Component<HueShiftControlsProps> = (props) => {
  return (
    <div class="hue-shift-controls">
      <div class="control-group">
        <label for="intensity-slider">
          Shift Intensity: {props.intensity.toFixed(2)}
        </label>
        <Slider
          id="intensity-slider"
          min={0}
          max={1}
          step={0.01}
          value={props.intensity}
          onChange={props.onIntensityChange}
          class="slider intensity-slider"
        />
        <div class="slider-labels">
          <span>Subtle</span>
          <span>Strong</span>
        </div>
      </div>

      <div class="control-group">
        <label for="ramp-stops-slider">
          Color Ramp Stops: {props.rampStops}
        </label>
        <Slider
          id="ramp-stops-slider"
          min={3}
          max={9}
          step={1}
          value={props.rampStops}
          onChange={props.onRampStopsChange}
          class="slider ramp-stops-slider"
        />
        <div class="slider-labels">
          <span>3</span>
          <span>9</span>
        </div>
      </div>

      <div class="preset-buttons">
        <h4>Quick Presets</h4>
        <div class="preset-grid">
          <button
            class="preset-button subtle"
            onClick={() => props.onIntensityChange(0.2)}
          >
            Subtle
          </button>
          <button
            class="preset-button moderate"
            onClick={() => props.onIntensityChange(0.4)}
          >
            Moderate
          </button>
          <button
            class="preset-button strong"
            onClick={() => props.onIntensityChange(0.6)}
          >
            Strong
          </button>
          <button
            class="preset-button extreme"
            onClick={() => props.onIntensityChange(0.8)}
          >
            Extreme
          </button>
        </div>
      </div>

      <div class="info-panel">
        <h4>About Hue Shifting</h4>
        <div class="info-content">
          <div class="info-item">
            <strong>Intensity:</strong> Controls how much the hue shifts between
            shadows and highlights. Higher values create more dramatic color
            changes.
          </div>
          <div class="info-item">
            <strong>Ramp Stops:</strong> Number of colors in the generated ramp.
            More stops create smoother gradients but use more palette space.
          </div>
        </div>
      </div>
    </div>
  );
};
