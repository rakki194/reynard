import { Component } from "solid-js";
import type { MaterialColors } from "../types/materialTypes";
import { MATERIAL_PATTERNS } from "../utils/hueShiftingAlgorithms";
import "./MaterialDemo.css";

interface MaterialDemoProps {
  selectedMaterial: keyof typeof MATERIAL_PATTERNS;
  materialColors: MaterialColors;
}

export const MaterialDemo: Component<MaterialDemoProps> = props => {
  return (
    <div class="material-demo">
      <h3>Material Properties</h3>
      <div class="properties-display">
        {Object.entries(MATERIAL_PATTERNS[props.selectedMaterial]).map(([key, value]) => (
          <div class="property-item">
            <span class="property-name">{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</span>
            <span class="property-value">{value}</span>
          </div>
        ))}
      </div>

      <h3>Color Variations</h3>
      <div class="color-variations">
        <div class="color-variation">
          <div
            class="variation-swatch shadow"
            style={{
              "--swatch-color": `oklch(${props.materialColors.shadow.l}% ${props.materialColors.shadow.c} ${props.materialColors.shadow.h})`,
            }}
          />
          <div class="variation-info">
            <h4>Shadow</h4>
            <code>
              oklch({props.materialColors.shadow.l}% {props.materialColors.shadow.c} {props.materialColors.shadow.h})
            </code>
          </div>
        </div>

        <div class="color-variation">
          <div
            class="variation-swatch base"
            style={{
              "--swatch-color": `oklch(${props.materialColors.base.l}% ${props.materialColors.base.c} ${props.materialColors.base.h})`,
            }}
          />
          <div class="variation-info">
            <h4>Base</h4>
            <code>
              oklch({props.materialColors.base.l}% {props.materialColors.base.c} {props.materialColors.base.h})
            </code>
          </div>
        </div>

        <div class="color-variation">
          <div
            class="variation-swatch highlight"
            style={{
              "--swatch-color": `oklch(${props.materialColors.highlight.l}% ${props.materialColors.highlight.c} ${props.materialColors.highlight.h})`,
            }}
          />
          <div class="variation-info">
            <h4>Highlight</h4>
            <code>
              oklch({props.materialColors.highlight.l}% {props.materialColors.highlight.c}{" "}
              {props.materialColors.highlight.h})
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
