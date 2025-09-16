/**
 * Color Picker Component
 * Demonstrates interactive color selection with real-time updates
 */

import { Component, createSignal, createEffect } from "solid-js";
import { useNotifications } from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const ColorPicker: Component = () => {
  const { notify } = useNotifications();
  const [favoriteColor, setFavoriteColor] = createSignal("#007bff");
  let colorPreviewRef: HTMLDivElement | undefined;

  const handleColorChange = (color: string) => {
    setFavoriteColor(color);
    notify(`Favorite color changed to ${color}`, "info");
  };

  // Update CSS custom property when color changes
  createEffect(() => {
    if (colorPreviewRef) {
      colorPreviewRef.style.setProperty("--preview-color", favoriteColor());
    }
  });

  return (
    <div class="dashboard-card">
      <div class="card-header">
        <h3>
          {fluentIconsPackage.getIcon("palette") && (
            <span class="card-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("palette")?.outerHTML}
              />
            </span>
          )}
          Color Picker
        </h3>
      </div>
      <div class="card-content">
        <div class="color-picker-group">
          <input
            type="color"
            value={favoriteColor()}
            onInput={e => handleColorChange(e.target.value)}
            class="color-picker"
            title="Choose your favorite color"
          />
          <div ref={colorPreviewRef} class="color-preview" />
        </div>
        <p class="color-value">
          Selected: <code>{favoriteColor()}</code>
        </p>
      </div>
    </div>
  );
};
