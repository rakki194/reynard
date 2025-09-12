import { Component } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import type { SpriteData } from "../data/spriteData";

interface SpritePreviewProps {
  sprite: SpriteData;
  spriteColors: {
    shadow: OKLCHColor;
    base: OKLCHColor;
    highlight: OKLCHColor;
  };
}

export const SpritePreview: Component<SpritePreviewProps> = (props) => {
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
    <div class="sprite-preview">
      <div class="sprite-container">
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
          }),
        )}
      </div>

      <div class="sprite-info">
        <h4>{props.sprite.name} Sprite</h4>
        <div class="color-legend">
          <div class="legend-item">
            <div
              class="legend-color shadow"
              style={{
                "background-color": `oklch(${props.spriteColors.shadow.l}% ${props.spriteColors.shadow.c} ${props.spriteColors.shadow.h})`,
              }}
            />
            <span>Shadow</span>
          </div>
          <div class="legend-item">
            <div
              class="legend-color base"
              style={{
                "background-color": `oklch(${props.spriteColors.base.l}% ${props.spriteColors.base.c} ${props.spriteColors.base.h})`,
              }}
            />
            <span>Base</span>
          </div>
          <div class="legend-item">
            <div
              class="legend-color highlight"
              style={{
                "background-color": `oklch(${props.spriteColors.highlight.l}% ${props.spriteColors.highlight.c} ${props.spriteColors.highlight.h})`,
              }}
            />
            <span>Highlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
