/**
 * Icon Showcase Component
 * Interactive showcase for testing the icon system
 */

import { Component, For } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const IconShowcase: Component = () => {
  const commonIcons = ["save", "delete", "edit", "add", "search", "settings", "home", "heart"];

  return (
    <div class="playground-panel">
      <h3>Icon System</h3>
      <div class="icon-showcase">
        <div class="icon-category">
          <h4>Common Icons</h4>
          <div class="icon-grid">
            <For each={commonIcons}>
              {iconName => (
                <div class="icon-demo">
                  <div class="icon-preview">
                    {fluentIconsPackage.getIcon(iconName) && (
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon(iconName)?.outerHTML}
                      />
                    )}
                  </div>
                  <span class="icon-label">{iconName}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};
