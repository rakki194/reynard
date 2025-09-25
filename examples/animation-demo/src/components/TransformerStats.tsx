/**
 * 📊 Transformer Stats Component
 *
 * Statistics display for the transformer dance club demo
 */

import { Component } from "solid-js";

interface TransformerStatsProps {
  totalSparkles: number;
  currentHue: number;
  activeSparkles: number;
  dancingComponents: number;
  totalComponents: number;
  isPlaying: boolean;
}

export const TransformerStats: Component<TransformerStatsProps> = props => {
  return (
    <div class="animation-card">
      <h2 class="card-title">
        <span>📊</span>
        Dance Club Stats
      </h2>
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">Sparkles Created:</span>
          <span class="status-value">{props.totalSparkles}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Current Hue:</span>
          <span class="status-value">{props.currentHue}°</span>
        </div>
        <div class="status-item">
          <span class="status-label">Active Sparkles:</span>
          <span class="status-value">{props.activeSparkles}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Dancing Components:</span>
          <span class="status-value">{props.dancingComponents}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Components:</span>
          <span class="status-value">{props.totalComponents}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Status:</span>
          <span class="status-value">{props.isPlaying ? "Dancing" : "Paused"}</span>
        </div>
      </div>
    </div>
  );
};
