/**
 * Charts Showcase Page - Dedicated Page for Chart Demonstration
 * A standalone page showcasing the full power of Reynard's charting system
 */

import { Component } from "solid-js";
import { ChartsDemo, AppFooter } from "reynard-components-core";
import { fluentIconsPackage } from "reynard-fluent-icons";
import "../styles/app.css";
import "../styles/charts-showcase.css";

export const ChartsShowcasePage: Component = () => {
  const goHome = () => {
    window.location.hash = "";
  };

  return (
    <div class="charts-showcase-page">
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
          <h1 class="page-title">Charts Showcase</h1>
        </div>
      </header>
      <main class="showcase-main">
        <ChartsDemo />
      </main>
      <AppFooter />
    </div>
  );
};
