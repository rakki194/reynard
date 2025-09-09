/**
 * OKLCH Showcase Page - Dedicated Page for Color Demonstration
 * A standalone page showcasing the full power of Reynard's OKLCH color system
 */

import { Component } from "solid-js";
import { OKLCHShowcase, AppFooter } from "reynard-components";
import { fluentIconsPackage } from "reynard-fluent-icons";
import "../styles/app.css";
import "../styles/oklch-showcase.css";

export const OKLCHShowcasePage: Component = () => {
  const goHome = () => {
    window.location.hash = "";
  };

  return (
    <div class="oklch-showcase-page">
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
          <h1 class="page-title">OKLCH Color Showcase</h1>
        </div>
      </header>
      <main class="showcase-main">
        <OKLCHShowcase />
      </main>
      <AppFooter />
    </div>
  );
};
