/**
 * Demo Description Component
 *
 * Provides an overview of the embedding visualization system.
 */

import { Component } from "solid-js";
import { FeaturesGrid } from "./FeaturesGrid";

export const DemoDescription: Component = () => {
  return (
    <div class="demo-description">
      <h2>Comprehensive Embedding Analysis & Visualization</h2>
      <p>
        This demo showcases the complete embedding visualization system ported
        from Yipyap, featuring dimensionality reduction, statistical analysis,
        quality metrics, and 3D visualization.
      </p>

      <FeaturesGrid />
    </div>
  );
};
