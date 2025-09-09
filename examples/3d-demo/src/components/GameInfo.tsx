import { Component } from "solid-js";

export const GameInfo: Component = () => {
  return (
    <div class="game-info">
      <div class="info-section">
        <h3>🦊 About Reynard 3D</h3>
        <p>
          This demo showcases the powerful 3D capabilities of the Reynard
          framework, built on top of Three.js and optimized for modern web
          browsers.
        </p>
      </div>

      <div class="info-section">
        <h3>🎮 Controls</h3>
        <div class="controls-grid">
          <div class="control-item">
            <span class="control-key">🖱️ Mouse</span>
            <span class="control-desc">Look around and interact</span>
          </div>
          <div class="control-item">
            <span class="control-key">⌨️ WASD</span>
            <span class="control-desc">Move around (in applicable games)</span>
          </div>
          <div class="control-item">
            <span class="control-key">🖱️ Click</span>
            <span class="control-desc">Interact with objects</span>
          </div>
          <div class="control-item">
            <span class="control-key">🖱️ Scroll</span>
            <span class="control-desc">Zoom in/out</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>⚡ Features</h3>
        <ul class="features-list">
          <li>Real-time 3D rendering with WebGL</li>
          <li>Physics simulation and collision detection</li>
          <li>Particle systems and visual effects</li>
          <li>Procedural content generation</li>
          <li>Responsive design and mobile support</li>
          <li>Theme integration with Reynard</li>
        </ul>
      </div>
    </div>
  );
};
