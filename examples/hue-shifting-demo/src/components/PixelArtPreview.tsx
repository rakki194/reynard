import { Component, createMemo, createSignal } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { basicHueShift, materialHueShift } from "../utils/hueShiftingAlgorithms";
import "./PixelArtPreview.css";

interface PixelArtPreviewProps {
  baseColor: OKLCHColor;
  material: string;
  intensity: number;
}

export const PixelArtPreview: Component<PixelArtPreviewProps> = (props) => {
  const [selectedSprite, setSelectedSprite] = createSignal("character");
  
  const spriteColors = createMemo(() => {
    const base = props.baseColor;
    const material = props.material;
    const intensity = props.intensity;
    
    if (material === "custom") {
      return {
        shadow: basicHueShift(base, "shadow", intensity),
        base: base,
        highlight: basicHueShift(base, "highlight", intensity)
      };
    }
    
    return materialHueShift(base, material as any, intensity);
  });
  
  const sprites = {
    character: {
      name: "Character",
      pixels: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 2, 2, 2, 2, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 3, 3, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [0, 1, 1, 1, 1, 1, 1, 0]
      ]
    },
    tree: {
      name: "Tree",
      pixels: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 2, 2, 1, 1, 0],
        [1, 1, 2, 2, 2, 2, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [0, 0, 0, 3, 3, 0, 0, 0],
        [0, 0, 0, 3, 3, 0, 0, 0],
        [0, 0, 0, 3, 3, 0, 0, 0]
      ]
    },
    gem: {
      name: "Gem",
      pixels: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 2, 2, 1, 0, 0],
        [0, 1, 2, 3, 3, 2, 1, 0],
        [1, 2, 3, 3, 3, 3, 2, 1],
        [1, 2, 3, 3, 3, 3, 2, 1],
        [0, 1, 2, 3, 3, 2, 1, 0],
        [0, 0, 1, 2, 2, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0]
      ]
    }
  };
  
  const currentSprite = createMemo(() => sprites[selectedSprite() as keyof typeof sprites]);
  
  const getColorForPixel = (pixelValue: number): OKLCHColor => {
    const colors = spriteColors();
    switch (pixelValue) {
      case 1: return colors.shadow;
      case 2: return colors.base;
      case 3: return colors.highlight;
      default: return { l: 0, c: 0, h: 0 }; // Transparent
    }
  };
  
  return (
    <div class="pixel-art-preview">
      <div class="sprite-selector">
        <h4>Sprite Type</h4>
        <div class="sprite-buttons">
          {Object.entries(sprites).map(([key, sprite]) => (
            <button
              class={`sprite-button ${selectedSprite() === key ? 'selected' : ''}`}
              onClick={() => setSelectedSprite(key)}
            >
              {sprite.name}
            </button>
          ))}
        </div>
      </div>
      
      <div class="sprite-preview">
        <div class="sprite-container">
          {currentSprite().pixels.map((row, rowIndex) => 
            row.map((pixel, colIndex) => {
              const color = getColorForPixel(pixel);
              if (pixel === 0) return null;
              
              return (
                <div
                  class="pixel"
                  style={{
                    "background-color": `oklch(${color.l}% ${color.c} ${color.h})`,
                    "grid-column": colIndex + 1,
                    "grid-row": rowIndex + 1
                  }}
                />
              );
            })
          )}
        </div>
        
        <div class="sprite-info">
          <h4>{currentSprite().name} Sprite</h4>
          <div class="color-legend">
            <div class="legend-item">
              <div 
                class="legend-color shadow"
                style={{
                  "background-color": `oklch(${spriteColors().shadow.l}% ${spriteColors().shadow.c} ${spriteColors().shadow.h})`
                }}
              />
              <span>Shadow</span>
            </div>
            <div class="legend-item">
              <div 
                class="legend-color base"
                style={{
                  "background-color": `oklch(${spriteColors().base.l}% ${spriteColors().base.c} ${spriteColors().base.h})`
                }}
              />
              <span>Base</span>
            </div>
            <div class="legend-item">
              <div 
                class="legend-color highlight"
                style={{
                  "background-color": `oklch(${spriteColors().highlight.l}% ${spriteColors().highlight.c} ${spriteColors().highlight.h})`
                }}
              />
              <span>Highlight</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="comparison-view">
        <h4>Before vs After</h4>
        <div class="comparison-grid">
          <div class="comparison-item">
            <h5>RGB Shading</h5>
            <div class="comparison-sprite">
              {currentSprite().pixels.map((row, rowIndex) => 
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
                        "grid-row": rowIndex + 1
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
              {currentSprite().pixels.map((row, rowIndex) => 
                row.map((pixel, colIndex) => {
                  const color = getColorForPixel(pixel);
                  if (pixel === 0) return null;
                  
                  return (
                    <div
                      class="pixel"
                      style={{
                        "background-color": `oklch(${color.l}% ${color.c} ${color.h})`,
                        "grid-column": colIndex + 1,
                        "grid-row": rowIndex + 1
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
