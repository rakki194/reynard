/**
 * Advanced Features Component
 * Demonstrates conditional rendering and toggle functionality
 */

import { Component, createSignal } from "solid-js";
import { useNotifications } from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const AdvancedFeatures: Component = () => {
  const { notify } = useNotifications();
  const [showAdvanced, setShowAdvanced] = createSignal(false);

  const handleAdvancedToggle = () => {
    setShowAdvanced(!showAdvanced());
    notify(showAdvanced() ? "Advanced features hidden" : "Advanced features shown", "info");
  };

  return (
    <div class="dashboard-card">
      <div class="card-header">
        <h3>
          {fluentIconsPackage.getIcon("settings") && (
            <span class="card-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("settings")?.outerHTML}
              />
            </span>
          )}
          Advanced Features
        </h3>
      </div>
      <div class="card-content">
        <button class="button button--secondary" onClick={handleAdvancedToggle}>
          {fluentIconsPackage.getIcon(showAdvanced() ? "eye-off" : "eye") && (
            <span
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(showAdvanced() ? "eye-off" : "eye")?.outerHTML}
            />
          )}
          {showAdvanced() ? "Hide" : "Show"} Advanced
        </button>
        {showAdvanced() && (
          <div class="advanced-features">
            <p>🔧 Advanced features are now visible!</p>
            <p>This demonstrates conditional rendering with SolidJS signals.</p>
          </div>
        )}
      </div>
    </div>
  );
};
