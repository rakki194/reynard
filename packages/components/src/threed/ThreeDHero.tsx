/**
 * 3D Hero Section Component
 * Hero section for the 3D showcase with preview visualization
 */

import { Component, createEffect } from "solid-js";
import { useTheme } from "reynard-themes";
import { PointCloudVisualization } from "./PointCloudVisualization";
import type { Scene, PerspectiveCamera, WebGLRenderer } from "three";

interface ThreeDHeroProps {
  onSceneReady: (scene: Scene | null, camera: PerspectiveCamera | null, renderer: WebGLRenderer | null) => void;
}

export const ThreeDHero: Component<ThreeDHeroProps> = (props) => {
  const themeContext = useTheme();

  // Call the onSceneReady callback for compatibility
  // The PointCloudVisualization handles its own scene management
  createEffect(() => {
    props.onSceneReady(null, null, null);
  });

  return (
    <div class="showcase-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          3D Visualization Showcase
        </h1>
        <p class="hero-subtitle">
          Experience the power of immersive 3D data visualization with Reynard's Three.js integration.
          Featuring interactive point clouds, cluster analysis, and OKLCH color management.
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">3D</span>
            <span class="stat-label">Graphics</span>
          </div>
          <div class="stat">
            <span class="stat-number">Interactive</span>
            <span class="stat-label">Controls</span>
          </div>
          <div class="stat">
            <span class="stat-number">OKLCH</span>
            <span class="stat-label">Colors</span>
          </div>
        </div>
      </div>
      <div class="hero-visualization">
        <div class="threed-preview">
          <PointCloudVisualization
            width={400}
            height={300}
            theme={themeContext.theme}
            pointCount={600}
          />
        </div>
      </div>
    </div>
  );
};
