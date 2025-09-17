import { Component } from "solid-js";
import type { DemoStats as DemoStatsType } from "../types";

interface DemoStatsProps {
  objectCount: number;
  collisionCount: number;
  stats: DemoStatsType;
}

/**
 * Demo statistics display component
 */
export const DemoStats: Component<DemoStatsProps> = props => {
  return (
    <div class="demo-stats">
      <div class="stat-item">
        <span class="stat-label">Objects:</span>
        <span class="stat-value">{props.objectCount}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Collisions:</span>
        <span class="stat-value">{props.collisionCount}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">FPS:</span>
        <span class="stat-value">{props.stats.fps}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Frame Time:</span>
        <span class="stat-value">{props.stats.lastFrameTime.toFixed(2)}ms</span>
      </div>
    </div>
  );
};
