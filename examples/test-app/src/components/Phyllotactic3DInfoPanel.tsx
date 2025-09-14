/**
 * 🦊 3D Phyllotactic Info Panel
 * Information panel describing 3D phyllotactic features
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";

export const Phyllotactic3DInfoPanel: Component = () => {
  return (
    <Card class="info-panel">
      <h3>3D Phyllotactic Features</h3>
      <div class="feature-descriptions">
        <div class="feature-description">
          <h4>3D Spiral Generation</h4>
          <p>
            Extends Vogel's model into 3D space with height and pitch control
            for complex structures.
          </p>
        </div>
        <div class="feature-description">
          <h4>Multi-Axis Rotation</h4>
          <p>
            Independent rotation controls for X, Y, and Z axes with real-time
            animation.
          </p>
        </div>
        <div class="feature-description">
          <h4>Spherical Projection</h4>
          <p>
            Optional spherical projection for creating spherical phyllotactic
            patterns.
          </p>
        </div>
        <div class="feature-description">
          <h4>3D Stroboscopic Effects</h4>
          <p>
            Advanced stroboscopic effects that work in 3D space with depth-based
            intensity.
          </p>
        </div>
      </div>
    </Card>
  );
};
