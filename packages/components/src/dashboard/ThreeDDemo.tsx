/**
 * 3D Demo Component
 * Quick demonstration of Reynard's 3D visualization capabilities
 */

import { Component } from "solid-js";
import { useTheme } from "reynard-themes";
import { PointCloudVisualization } from "../threed";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const ThreeDDemo: Component = () => {
  const themeContext = useTheme();

  const goTo3DShowcase = () => {
    window.location.hash = "threed-showcase";
  };

  return (
    <div class="dashboard-card threed-demo">
      <div class="card-header">
        <h3>
          {fluentIconsPackage.getIcon("cube") && (
            <span class="card-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("cube")?.outerHTML}
              />
            </span>
          )}
          3D Demo
        </h3>
        <button class="showcase-button" onClick={goTo3DShowcase}>
          View Full Showcase
        </button>
      </div>
      
      <div class="threed-preview">
        <PointCloudVisualization
          width={200}
          height={150}
          theme={themeContext.theme}
          pointCount={200}
        />
      </div>
      
      <div class="card-footer">
        <div class="stats-row">
          <span class="stat">
            <strong>200</strong> Points
          </span>
          <span class="stat">
            <strong>3D</strong> WebGL
          </span>
        </div>
      </div>
    </div>
  );
};
