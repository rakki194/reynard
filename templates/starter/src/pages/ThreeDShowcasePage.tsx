/**
 * 3D Showcase Page - Dedicated Page for 3D Visualization Demonstration
 * A standalone page showcasing the full power of Reynard's 3D visualization system
 */

import { Component } from "solid-js";
import { ThreeDShowcaseSimple, AppFooter } from "reynard-components-core";
import { fluentIconsPackage } from "reynard-fluent-icons";
import "../styles/app.css";
import "../styles/threed-showcase.css";

export const ThreeDShowcasePage: Component = () => {
  const goHome = () => {
    window.location.hash = "";
  };

  return (
    <div class="threed-showcase-page">
      <header class="showcase-page-header">
        <div class="header-content">
          <button class="back-button" onClick={goHome}>
            {fluentIconsPackage.getIcon("arrow-left") && (
              <span
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("arrow-left")?.outerHTML}
              />
            )}
            Back to Home
          </button>
          <h1 class="page-title">3D Visualization Showcase</h1>
        </div>
      </header>
      <main class="showcase-main">
        <ThreeDShowcaseSimple />
      </main>
      <AppFooter />
    </div>
  );
};
