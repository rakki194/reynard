/**
 * 🦊 Info Component
 * Information panel for the integration demo
 */

import { Component } from "solid-js";
import { Card } from "reynard-primitives";

export const Info: Component = () => {
  return (
    <div class="demo-info">
      <Card class="info-panel">
        <h3>Integrated Features</h3>
        <div class="integration-features">
          <div class="feature-item">
            <h4>🦊 Advanced Pattern Generation</h4>
            <p>ROTASE, Bernoulli, and enhanced Vogel patterns with morphing capabilities.</p>
          </div>
          <div class="feature-item">
            <h4>🌀 Stroboscopic Effects</h4>
            <p>Mathematical stroboscopic effects with temporal aliasing and morphing.</p>
          </div>
          <div class="feature-item">
            <h4>🌐 3D Support</h4>
            <p>Full 3D phyllotactic structures with multi-axis rotation and spherical projection.</p>
          </div>
          <div class="feature-item">
            <h4>⚡ Performance Optimization</h4>
            <p>Adaptive quality, spatial culling, LOD, and intelligent throttling.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
