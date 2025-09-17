import { Component, createMemo } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { allIcons } from "reynard-fluent-icons";
import "./ColorRamp.css";

interface ColorRampProps {
  colors: OKLCHColor[];
}

export const ColorRamp: Component<ColorRampProps> = props => {
  const colorStrings = createMemo(() => props.colors.map(color => `oklch(${color.l}% ${color.c} ${color.h})`));

  const copyToClipboard = async (colorString: string) => {
    try {
      await navigator.clipboard.writeText(colorString);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy color:", err);
    }
  };

  return (
    <div class="color-ramp">
      <div class="ramp-container">
        {colorStrings().map((colorString, index) => (
          <div class="ramp-color">
            <div
              class="color-swatch"
              style={{ "background-color": colorString }}
              onClick={() => copyToClipboard(colorString)}
              title={`Click to copy: ${colorString}`}
            />
            <div class="color-info">
              <span class="color-index">{index + 1}</span>
              <span class="color-value">{colorString}</span>
            </div>
          </div>
        ))}
      </div>

      <div class="ramp-actions">
        <button class="action-button copy-all" onClick={() => copyToClipboard(colorStrings().join("\n"))}>
          <span innerHTML={allIcons.copy.svg}></span> Copy All Colors
        </button>
        <button
          class="action-button export-css"
          onClick={() => {
            const cssVars = colorStrings()
              .map((color, i) => `  --color-${i + 1}: ${color};`)
              .join("\n");
            copyToClipboard(`:root {\n${cssVars}\n}`);
          }}
        >
          <span innerHTML={allIcons["window-brush"].svg}></span> Export as CSS Variables
        </button>
      </div>
    </div>
  );
};
