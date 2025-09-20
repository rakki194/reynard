/**
 * Theme Features Component
 * Displays list of theme system features
 */

import { Component, For } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const ThemeFeatures: Component = () => {
  const features = [
    "LCH Color Space for consistent colors",
    "CSS Custom Properties for dynamic switching",
    "Accessibility support with high contrast themes",
    "System theme detection and automatic switching",
    "Reduced motion support for accessibility",
  ];

  return (
    <div class="theme-features">
      <h4>Theme Features</h4>
      <ul class="feature-list">
        <For each={features}>
          {feature => (
            <li>
              {fluentIconsPackage.getIcon("checkmark") && (
                <span class="feature-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
                  />
                </span>
              )}
              {feature}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
