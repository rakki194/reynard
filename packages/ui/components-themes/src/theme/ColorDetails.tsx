/**
 * Color Details Component
 * Displays theme color palette with copy functionality
 */

import { Component, For, createEffect } from "solid-js";
import { type ThemeColor } from "./theme-utils";

interface ColorDetailsProps {
  colors: ThemeColor[];
  onCopyColor: (color: string) => void;
}

export const ColorDetails: Component<ColorDetailsProps> = props => {
  return (
    <div class="color-details">
      <h4>Color Palette</h4>
      <div class="color-grid">
        <For each={props.colors}>
          {color => {
            let swatchRef: HTMLDivElement | undefined;

            // Update CSS custom property when color changes
            createEffect(() => {
              if (swatchRef) {
                swatchRef.style.setProperty("--swatch-color", color.value);
              }
            });

            return (
              <div class="color-item">
                <div
                  ref={swatchRef}
                  class="color-swatch"
                  onClick={() => props.onCopyColor(color.value)}
                  title={`Click to copy ${color.value}`}
                />
                <div class="color-info">
                  <span class="color-name">{color.name}</span>
                  <code class="color-value">{color.value}</code>
                  <code class="color-var">{color.var}</code>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
