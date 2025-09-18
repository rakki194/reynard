import { Component } from "solid-js";
import type { PhysicsStats } from "../types";

export interface PhysicsStatsComponentProps {
  objects: () => number;
  collisions: () => number;
  stats: PhysicsStats;
}

/**
 * Statistics display component for physics simulation
 * Shows object count, collisions, FPS, and total energy
 */
export const PhysicsStatsComponent: Component<PhysicsStatsComponentProps> = props => {
  return (
    <div class="demo-stats">
      <div class="stat-item">
        <span class="stat-label">Objects:</span>
        <span class="stat-value">{props.objects()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Collisions:</span>
        <span class="stat-value">{props.collisions()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">FPS:</span>
        <span class="stat-value">{props.stats.fps}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Energy:</span>
        <span class="stat-value">{props.stats.totalEnergy?.toFixed(1) ?? "0.0"}</span>
      </div>
    </div>
  );
};
