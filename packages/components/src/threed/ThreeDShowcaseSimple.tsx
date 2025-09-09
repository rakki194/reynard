/**
 * 3D Visualization Showcase - Refactored Version
 * A modular demonstration of Reynard's 3D visualization capabilities
 */

import { Component, createSignal, createMemo } from "solid-js";
import { useTheme } from "reynard-themes";
import {
  ThreeDHero,
  ThreeDControls,
  ThreeDVisualizations,
  ThreeDPerformance,
  ThreeDTechnicalInfo,
} from ".";

export const ThreeDShowcaseSimple: Component = () => {
  const themeContext = useTheme();

  // Interactive state
  const [selectedTheme, setSelectedTheme] = createSignal(themeContext.theme);
  const [selectedVisualization, setSelectedVisualization] =
    createSignal("point-cloud");
  const [animationEnabled, setAnimationEnabled] = createSignal(true);

  // Handle scene ready from hero component (for compatibility)
  const handleSceneReady = () => {
    // Simple scene ready handler - not needed for SimpleThreeDVisualization
  };

  // Sample point count for performance display
  const pointCount = createMemo(() => {
    // Calculate based on selected visualization
    switch (selectedVisualization()) {
      case "point-cloud":
        return 150; // 3 clusters * 50 points
      case "clusters":
        return 150;
      case "embeddings":
        return 200;
      default:
        return 150;
    }
  });

  return (
    <section class="threed-showcase">
      <ThreeDHero onSceneReady={handleSceneReady} />

      <ThreeDControls
        selectedTheme={selectedTheme()}
        onThemeChange={setSelectedTheme}
        selectedVisualization={selectedVisualization()}
        onVisualizationChange={setSelectedVisualization}
        animationEnabled={animationEnabled()}
        onAnimationToggle={setAnimationEnabled}
      />

      <ThreeDVisualizations
        selectedVisualization={selectedVisualization()}
        theme={selectedTheme()}
      />

      <ThreeDPerformance theme={selectedTheme()} pointCount={pointCount()} />

      <ThreeDTechnicalInfo />
    </section>
  );
};
