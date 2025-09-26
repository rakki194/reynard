/**
 * 🦊 Status Component
 * Status panel for the integration demo
 */

import { Component } from "solid-js";
import { Card } from "reynard-primitives";

export interface StatusProps {
  mode: () => "2d" | "3d";
  patternType: () => "vogel" | "rotase" | "bernoulli" | "fibonacci-sibling";
  currentPoints: () => any[];
  stroboscopicState: () => any;
  qualityLevel: () => any;
  enablePerformanceOptimization: () => boolean;
}

export const Status: Component<StatusProps> = props => {
  return (
    <Card class="status-panel">
      <h3>System Status</h3>
      <div class="status-info">
        <div class="status-item">
          <span class="status-label">Mode:</span>
          <span class="status-value">{props.mode().toUpperCase()}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Pattern:</span>
          <span class="status-value">{props.patternType().toUpperCase()}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Points:</span>
          <span class="status-value">{props.currentPoints().length}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Stroboscopic:</span>
          <span class={`status-value ${props.stroboscopicState()?.isStroboscopic ? "active" : "inactive"}`}>
            {props.stroboscopicState()?.isStroboscopic ? "Active" : "Inactive"}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Quality Level:</span>
          <span class="status-value">{props.qualityLevel()?.level || 0}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Performance:</span>
          <span class={`status-value ${props.enablePerformanceOptimization() ? "optimized" : "normal"}`}>
            {props.enablePerformanceOptimization() ? "Optimized" : "Normal"}
          </span>
        </div>
      </div>
    </Card>
  );
};
