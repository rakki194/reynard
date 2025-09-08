/**
 * Color Controls Component
 * Interactive controls for OKLCH color manipulation
 */

import { Component } from "solid-js";

interface ColorControlsProps {
  selectedHue: number;
  selectedLightness: number;
  selectedChroma: number;
  animationSpeed: number;
  onHueChange: (hue: number) => void;
  onLightnessChange: (lightness: number) => void;
  onChromaChange: (chroma: number) => void;
  onSpeedChange: (speed: number) => void;
}

export const ColorControls: Component<ColorControlsProps> = (props) => {
  return (
    <div class="color-controls-section">
      <h2>Interactive Color Laboratory</h2>
      <div class="controls-grid">
        <div class="control-group">
          <label for="hue-slider">Hue: {props.selectedHue}°</label>
          <input
            id="hue-slider"
            type="range"
            min="0"
            max="360"
            value={props.selectedHue}
            onInput={(e) => props.onHueChange(parseInt(e.target.value))}
            class="hue-slider"
            aria-label="Hue control"
          />
        </div>
        <div class="control-group">
          <label for="lightness-slider">Lightness: {props.selectedLightness}%</label>
          <input
            id="lightness-slider"
            type="range"
            min="0"
            max="100"
            value={props.selectedLightness}
            onInput={(e) => props.onLightnessChange(parseInt(e.target.value))}
            class="lightness-slider"
            aria-label="Lightness control"
          />
        </div>
        <div class="control-group">
          <label for="chroma-slider">Chroma: {props.selectedChroma.toFixed(2)}</label>
          <input
            id="chroma-slider"
            type="range"
            min="0"
            max="0.4"
            step="0.01"
            value={props.selectedChroma}
            onInput={(e) => props.onChromaChange(parseFloat(e.target.value))}
            class="chroma-slider"
            aria-label="Chroma control"
          />
        </div>
        <div class="control-group">
          <label for="speed-slider">Animation Speed: {props.animationSpeed}</label>
          <input
            id="speed-slider"
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={props.animationSpeed}
            onInput={(e) => props.onSpeedChange(parseFloat(e.target.value))}
            class="speed-slider"
            aria-label="Animation speed control"
          />
        </div>
      </div>
    </div>
  );
};
