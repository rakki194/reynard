/**
 * Playground Header Component
 * Header section for the component playground
 */

import { Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const PlaygroundHeader: Component = () => {
  return (
    <div class="section-header">
      <h2>
        {fluentIconsPackage.getIcon("code") && (
          <span class="section-icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("code")?.outerHTML}
            />
          </span>
        )}
        Component Playground
      </h2>
      <p>Interactive playground for testing Reynard components and features</p>
    </div>
  );
};
