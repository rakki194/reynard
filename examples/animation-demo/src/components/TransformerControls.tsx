/**
 * 🎛️ Transformer Controls Component
 *
 * Interactive controls for the transformer dance club demo
 */

import { Component } from "solid-js";

interface AnimationConfig {
  strobeSpeed: number;
  danceFloorSpeed: number;
  componentPulseSpeed: number;
  autoDanceInterval: number;
  backgroundHueSpeed: number;
}

interface TransformerControlsProps {
  animationConfig: AnimationConfig;
  isPlaying: boolean;
  onConfigUpdate: (key: keyof AnimationConfig, value: number) => void;
  onStartStop: () => void;
  onForwardPass: () => void;
  onAttentionViz: () => void;
  onBurstEffect: () => void;
}

export const TransformerControls: Component<TransformerControlsProps> = props => {
  return (
    <div class="animation-card">
      <h2 class="card-title">
        <span>🎛️</span>
        Animation Controls
      </h2>
      <div class="demo-controls">
        <div class="control-group">
          <label class="control-label">Strobe Speed (ms)</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={props.animationConfig.strobeSpeed}
            onInput={e => props.onConfigUpdate("strobeSpeed", parseInt(e.currentTarget.value))}
          />
          <span class="control-value">{props.animationConfig.strobeSpeed}ms</span>
        </div>

        <div class="control-group">
          <label class="control-label">Dance Floor Speed (ms)</label>
          <input
            type="range"
            min="1000"
            max="5000"
            step="100"
            value={props.animationConfig.danceFloorSpeed}
            onInput={e => props.onConfigUpdate("danceFloorSpeed", parseInt(e.currentTarget.value))}
          />
          <span class="control-value">{props.animationConfig.danceFloorSpeed}ms</span>
        </div>

        <div class="control-group">
          <label class="control-label">Auto-Dance Interval (ms)</label>
          <input
            type="range"
            min="1000"
            max="5000"
            step="100"
            value={props.animationConfig.autoDanceInterval}
            onInput={e => props.onConfigUpdate("autoDanceInterval", parseInt(e.currentTarget.value))}
          />
          <span class="control-value">{props.animationConfig.autoDanceInterval}ms</span>
        </div>

        <div class="control-group">
          <label class="control-label">Background Hue Speed (ms)</label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={props.animationConfig.backgroundHueSpeed}
            onInput={e => props.onConfigUpdate("backgroundHueSpeed", parseInt(e.currentTarget.value))}
          />
          <span class="control-value">{props.animationConfig.backgroundHueSpeed}ms</span>
        </div>

        <div class="control-group">
          <button class={`control-button ${props.isPlaying ? "danger" : "primary"}`} onClick={props.onStartStop}>
            {props.isPlaying ? "⏹️ Stop" : "▶️ Start"} Animations
          </button>
        </div>

        <div class="control-group">
          <button class="control-button" onClick={props.onForwardPass}>
            🚀 Animate Forward Pass
          </button>
          <button class="control-button" onClick={props.onAttentionViz}>
            👀 Attention Visualization
          </button>
          <button class="control-button" onClick={props.onBurstEffect}>
            ✨ Burst Effect
          </button>
        </div>
      </div>
    </div>
  );
};
