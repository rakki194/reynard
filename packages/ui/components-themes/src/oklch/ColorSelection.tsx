/**
 * Color Selection Component
 * Handles base color selection for OKLCH demo
 */

import { Component, For, onMount } from "solid-js";
import { useThemeColors } from "reynard-themes";
import "./ColorSelection.css";

interface ColorSelectionProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const ColorSelection: Component<ColorSelectionProps> = props => {
  const themeColors = useThemeColors();

  const colorOptions = ["primary", "secondary", "accent", "success", "warning", "error", "info"];

  return (
    <div class="color-selection">
      <h3>Select Base Color</h3>
      <div class="color-options">
        <For each={colorOptions}>
          {color => (
            <button
              class={`color-option ${props.selectedColor === color ? "active" : ""}`}
              ref={el => {
                if (el) {
                  el.style.setProperty("--dynamic-color", themeColors.getColor(color));
                }
              }}
              onClick={() => props.onColorSelect(color)}
            >
              {color}
            </button>
          )}
        </For>
      </div>
    </div>
  );
};
