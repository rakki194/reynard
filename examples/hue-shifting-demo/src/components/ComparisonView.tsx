import { Component } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import type { SpriteData } from "../data/spriteData";

interface ComparisonViewProps {
  sprite: SpriteData;
  baseColor: OKLCHColor;
  spriteColors: {
    shadow: OKLCHColor;
    base: OKLCHColor;
    highlight: OKLCHColor;
  };
}

export const ComparisonView: Component<ComparisonViewProps> = props => {
  const getColorForPixel = (pixelValue: number): OKLCHColor => {
    switch (pixelValue) {
      case 1:
        return props.spriteColors.shadow;
      case 2:
        return props.spriteColors.base;
      case 3:
        return props.spriteColors.highlight;
      default:
        return { l: 0, c: 0, h: 0 }; // Transparent
    }
  };

  return (
    <div class="comparison-view">
      <h4>Before vs After</h4>
      <div class="comparison-grid">
        <div class="comparison-item">
          <h5>RGB Shading</h5>
          <div class="comparison-sprite">
            {props.sprite.pixels.map((row, rowIndex) =>
              row.map((pixel, colIndex) => {
                if (pixel === 0) return null;

                // Simulate RGB-based shading (just lightness changes)
                const baseL = props.baseColor.l;
                let lightness = baseL;
                if (pixel === 1) lightness = baseL - 30; // Shadow
                if (pixel === 3) lightness = baseL + 25; // Highlight

                return (
                  <div
                    class="pixel"
                    style={{
                      "background-color": `oklch(${lightness}% ${props.baseColor.c} ${props.baseColor.h})`,
                      "grid-column": colIndex + 1,
                      "grid-row": rowIndex + 1,
                    }}
                  />
                );
              })
            )}
          </div>
        </div>

        <div class="comparison-item">
          <h5>OKLCH Hue Shifting</h5>
          <div class="comparison-sprite">
            {props.sprite.pixels.map((row, rowIndex) =>
              row.map((pixel, colIndex) => {
                const color = getColorForPixel(pixel);
                if (pixel === 0) return null;

                return (
                  <div
                    class="pixel"
                    style={{
                      "background-color": `oklch(${color.l}% ${color.c} ${color.h})`,
                      "grid-column": colIndex + 1,
                      "grid-row": rowIndex + 1,
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
