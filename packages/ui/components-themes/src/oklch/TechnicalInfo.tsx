/**
 * Technical Info Component
 * Technical information about OKLCH implementation
 */

import { Component } from "solid-js";

export const TechnicalInfo: Component = () => {
  return (
    <div class="technical-info">
      <h2>Technical Excellence</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>Perceptual Uniformity</h3>
          <p>
            OKLCH provides perceptually uniform color space, ensuring consistent visual weight across all hues and
            saturations.
          </p>
        </div>
        <div class="info-card">
          <h3>Theme Integration</h3>
          <p>
            Seamless integration with Reynard's theme system, providing automatic color adaptation for light, dark, and
            custom themes.
          </p>
        </div>
        <div class="info-card">
          <h3>Performance Optimized</h3>
          <p>
            Intelligent caching and optimized algorithms ensure sub-millisecond color generation with minimal memory
            footprint.
          </p>
        </div>
        <div class="info-card">
          <h3>Modern Standards</h3>
          <p>
            Built on modern CSS color specifications with fallbacks for maximum browser compatibility and
            future-proofing.
          </p>
        </div>
      </div>
    </div>
  );
};
