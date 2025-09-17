/**
 * Color Preview Component
 * Live color preview with variations display
 */

import { Component } from "solid-js";
import { ColorSwatch } from "./ColorSwatch";
import { ColorInfo } from "./ColorInfo";
import { VariationGrid } from "./VariationGrid";

interface ColorVariations {
  base: string;
  lighter: string;
  darker: string;
  moreSaturated: string;
  lessSaturated: string;
  complementary: string;
  triadic1: string;
  triadic2: string;
}

interface ColorPreviewProps {
  colorVariations: ColorVariations;
  selectedLightness: number;
  selectedChroma: number;
  selectedHue: number;
}

export const ColorPreview: Component<ColorPreviewProps> = props => {
  return (
    <div class="color-preview-section">
      <h2>Live Color Preview</h2>
      <div class="preview-grid">
        <div class="preview-card main-color">
          <ColorSwatch color={props.colorVariations.base} size="large" />
          <ColorInfo
            color={props.colorVariations.base}
            lightness={props.selectedLightness}
            chroma={props.selectedChroma}
            hue={props.selectedHue}
          />
        </div>

        <div class="preview-card variations">
          <h3>Color Variations</h3>
          <VariationGrid colorVariations={props.colorVariations} />
        </div>
      </div>
    </div>
  );
};
