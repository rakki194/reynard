/**
 * 🦊 Enhanced Visualization Component
 * Canvas visualization for the integration demo
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";

export interface VisualizationProps {
  mode: () => "2d" | "3d";
  patternType: () => "vogel" | "rotase" | "bernoulli" | "fibonacci-sibling";
  currentPoints: () => any[];
  enableStroboscopic: () => boolean;
  stroboscopicState: () => any;
}

export const EnhancedVisualization: Component<VisualizationProps> = props => {
  return (
    <div class="demo-visualization">
      <Card class="canvas-container">
        <canvas id="integration-canvas" class="demo-canvas"></canvas>
        <div class="canvas-overlay">
          <div class="overlay-info">
            <h4>Enhanced Integration System</h4>
            <p>
              {props.mode().toUpperCase()} {props.patternType().toUpperCase()} Pattern
            </p>
            <p>{props.currentPoints().length} points with advanced features</p>
            {props.enableStroboscopic() && props.stroboscopicState()?.isStroboscopic && (
              <p>✨ Stroboscopic effects active</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
