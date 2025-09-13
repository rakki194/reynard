/**
 * Audio Waveform Sub-components
 *
 * Sub-components for the Audio Waveform Visualizer to keep the main component
 * under the 140-line limit.
 */

import { Component, Show } from "solid-js";
import type {
import { Slider } from "reynard-components";
  AudioWaveformVisualizerProps,
  WaveformData,
} from "./AudioWaveformVisualizer";

// Loading State Component
export const LoadingState: Component = () => (
  <div class="loading-state">
    <div class="loading-spinner" />
    <span>Loading audio...</span>
  </div>
);

// Error State Component
export const ErrorState: Component<{ error: string }> = (props) => (
  <div class="error-state">
    <div class="error-icon">⚠️</div>
    <span>{props.error}</span>
  </div>
);

// Waveform Canvas Component
export const WaveformCanvas: Component<{
  waveformData: WaveformData | null;
  waveformConfig: () => any;
  interactionConfig: () => any;
  currentTime: () => number;
  duration: () => number;
  onWaveformClick: (event: MouseEvent) => void;
  canvasRef: HTMLCanvasElement | undefined;
}> = (props) => (
  <Show when={props.waveformData}>
    <div class="waveform-wrapper">
      <canvas
        ref={props.canvasRef}
        class="waveform-canvas"
        width={800}
        height={props.waveformConfig().height}
        onClick={props.onWaveformClick}
      />
    </div>
  </Show>
);

// Playback Controls Component
export const PlaybackControls: Component<{
  playbackConfig: () => any;
  isPlaying: () => boolean;
  currentTime: () => number;
  duration: () => number;
  volume: number;
  onTogglePlayback: () => void;
  onVolumeChange: (volume: number) => void;
  waveformData: WaveformData | null;
}> = (props) => (
  <Show when={props.playbackConfig().showControls}>
    <div class="playback-controls">
      <button
        type="button"
        class="play-button"
        onClick={props.onTogglePlayback}
        disabled={!props.waveformData}
      >
        <Show when={props.isPlaying()} fallback="▶️">
          ⏸️
        </Show>
      </button>

      <div class="time-display">
        <span class="current-time">
          {Math.floor(props.currentTime() / 60)}:
          {(props.currentTime() % 60).toFixed(0).padStart(2, "0")}
        </span>
        <span class="duration">
          {Math.floor(props.duration() / 60)}:
          {(props.duration() % 60).toFixed(0).padStart(2, "0")}
        </span>
      </div>

      <div class="volume-control">
        <span class="volume-icon">🔊</span>
        <Slider
    min={0}
    max={1}
    step={0.1}
  /> props.onVolumeChange(parseFloat(e.target.value))}
          class="volume-slider"
        />
      </div>
    </div>
  </Show>
);
