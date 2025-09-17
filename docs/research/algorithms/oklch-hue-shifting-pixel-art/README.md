# OKLCH Hue Shifting Algorithms for Pixel Art Games

## Overview

This document presents advanced hue shifting algorithms specifically designed for
pixel art games using the OKLCH color space. Unlike traditional RGB-based approaches,
OKLCH provides perceptually uniform color manipulation that creates more natural and
vibrant pixel art with superior visual appeal.

## Table of Contents

- [Introduction](#introduction)
- [OKLCH Color Space Fundamentals](#oklch-color-space-fundamentals)
- [Core Hue Shifting Algorithms](#core-hue-shifting-algorithms)
- [Advanced Techniques](#advanced-techniques)
- [Implementation Examples](#implementation-examples)
- [Performance Considerations](#performance-considerations)
- [Integration with Reynard Framework](#integration-with-reynard-framework)

## Introduction

Hue shifting in pixel art involves adjusting the hue of colors along with their brightness and
saturation to create more dynamic and realistic visuals. Traditional approaches using RGB or
HSL often produce inconsistent results due to the non-uniform nature of
these color spaces. OKLCH (OK Lightness Chroma Hue) provides a perceptually uniform alternative that
ensures consistent visual results across all hues.

### Why OKLCH for Pixel Art?

1. **Perceptual Uniformity**: Equal changes in OKLCH values produce equal visual changes
2. **Better Color Gradients**: Smoother transitions between colors
3. **Consistent Brightness**: Lightness values correspond directly to perceived brightness
4. **Wide Gamut Support**: Access to colors outside traditional sRGB space
5. **Modern Browser Support**: Native CSS support in modern browsers

## OKLCH Color Space Fundamentals

### Color Components

```typescript
interface OKLCHColor {
  l: number; // Lightness (0-100)
  c: number; // Chroma (0-0.4+)
  h: number; // Hue (0-360)
}
```

### Key Properties

- **Lightness (L)**: Perceptually uniform brightness (0-100%)
- **Chroma (C)**: Color intensity/saturation (0-0.4+)
- **Hue (H)**: Color angle in degrees (0-360°)

## Core Hue Shifting Algorithms

### 1. Basic Hue Shifting

The fundamental algorithm for creating shadows and highlights with hue shifts.

```typescript
/**
 * Basic hue shifting algorithm for pixel art
 * @param baseColor - Base OKLCH color
 * @param shiftType - Type of shift (shadow, highlight, midtone)
 * @param intensity - Shift intensity (0-1)
 * @returns Shifted OKLCH color
 */
function basicHueShift(
  baseColor: OKLCHColor,
  shiftType: "shadow" | "highlight" | "midtone",
  intensity: number = 0.3
): OKLCHColor {
  const { l, c, h } = baseColor;

  switch (shiftType) {
    case "shadow":
      return {
        l: Math.max(0, l - intensity * 30), // Darker
        c: Math.min(0.4, c + intensity * 0.1), // More saturated
        h: (h - intensity * 20 + 360) % 360, // Shift toward cooler colors
      };

    case "highlight":
      return {
        l: Math.min(100, l + intensity * 25), // Lighter
        c: Math.min(0.4, c + intensity * 0.05), // Slightly more saturated
        h: (h + intensity * 15 + 360) % 360, // Shift toward warmer colors
      };

    case "midtone":
      return {
        l: l, // Keep same lightness
        c: Math.min(0.4, c + intensity * 0.08), // Increase saturation
        h: (h + intensity * 5 + 360) % 360, // Subtle hue shift
      };
  }
}
```

### 2. Advanced Multi-Stop Hue Shifting

Creates multiple color stops for complex shading with varying hue shifts.

```typescript
/**
 * Generate a complete color ramp with hue shifting
 * @param baseColor - Base OKLCH color
 * @param stops - Number of color stops
 * @param shadowShift - Shadow hue shift amount
 * @param highlightShift - Highlight hue shift amount
 * @returns Array of OKLCH colors
 */
function generateHueShiftRamp(
  baseColor: OKLCHColor,
  stops: number = 5,
  shadowShift: number = 25,
  highlightShift: number = 20
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  const { l, c, h } = baseColor;

  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1); // 0 to 1
    const lightness = l + (t - 0.5) * 40; // -20 to +20 from base
    const chroma = c + Math.sin(t * Math.PI) * 0.1; // Peak at middle

    // Calculate hue shift based on position
    let hueShift = 0;
    if (t < 0.5) {
      // Shadow side - shift toward cooler colors
      hueShift = -shadowShift * (0.5 - t) * 2;
    } else {
      // Highlight side - shift toward warmer colors
      hueShift = highlightShift * (t - 0.5) * 2;
    }

    colors.push({
      l: Math.max(0, Math.min(100, lightness)),
      c: Math.max(0.05, Math.min(0.4, chroma)),
      h: (h + hueShift + 360) % 360,
    });
  }

  return colors;
}
```

### 3. Material-Based Hue Shifting

Different materials require different hue shifting patterns.

```typescript
/**
 * Material-specific hue shifting patterns
 */
const MATERIAL_PATTERNS = {
  metal: {
    shadowShift: 30,
    highlightShift: 15,
    chromaBoost: 0.15,
    lightnessRange: 50,
  },
  skin: {
    shadowShift: 20,
    highlightShift: 25,
    chromaBoost: 0.08,
    lightnessRange: 35,
  },
  fabric: {
    shadowShift: 15,
    highlightShift: 10,
    chromaBoost: 0.05,
    lightnessRange: 40,
  },
  plastic: {
    shadowShift: 10,
    highlightShift: 20,
    chromaBoost: 0.12,
    lightnessRange: 45,
  },
};

function materialHueShift(
  baseColor: OKLCHColor,
  material: keyof typeof MATERIAL_PATTERNS,
  intensity: number = 1.0
): { shadow: OKLCHColor; base: OKLCHColor; highlight: OKLCHColor } {
  const pattern = MATERIAL_PATTERNS[material];
  const { l, c, h } = baseColor;

  return {
    shadow: {
      l: Math.max(0, l - pattern.lightnessRange * 0.6 * intensity),
      c: Math.min(0.4, c + pattern.chromaBoost * intensity),
      h: (h - pattern.shadowShift * intensity + 360) % 360,
    },
    base: {
      l: l,
      c: c,
      h: h,
    },
    highlight: {
      l: Math.min(100, l + pattern.lightnessRange * 0.4 * intensity),
      c: Math.min(0.4, c + pattern.chromaBoost * 0.5 * intensity),
      h: (h + pattern.highlightShift * intensity + 360) % 360,
    },
  };
}
```

## Advanced Techniques

### 1. Golden Ratio Hue Distribution

Uses the golden ratio for optimal color distribution in palettes.

```typescript
/**
 * Generate hue-shifted palette using golden ratio distribution
 * @param baseColor - Base OKLCH color
 * @param count - Number of colors in palette
 * @returns Array of OKLCH colors
 */
function goldenRatioHuePalette(baseColor: OKLCHColor, count: number = 8): OKLCHColor[] {
  const GOLDEN_ANGLE = 137.508; // Golden angle in degrees
  const colors: OKLCHColor[] = [];
  const { l, c } = baseColor;

  for (let i = 0; i < count; i++) {
    const hue = (baseColor.h + i * GOLDEN_ANGLE) % 360;
    const lightnessVariation = Math.sin(i * 0.5) * 15; // Subtle lightness variation
    const chromaVariation = Math.cos(i * 0.3) * 0.05; // Subtle chroma variation

    colors.push({
      l: Math.max(0, Math.min(100, l + lightnessVariation)),
      c: Math.max(0.05, Math.min(0.4, c + chromaVariation)),
      h: hue,
    });
  }

  return colors;
}
```

### 2. Adaptive Hue Shifting

Adjusts hue shifts based on the base color's properties.

```typescript
/**
 * Adaptive hue shifting based on color properties
 * @param baseColor - Base OKLCH color
 * @param context - Shading context
 * @returns Shifted colors
 */
function adaptiveHueShift(
  baseColor: OKLCHColor,
  context: {
    isWarm: boolean;
    isSaturated: boolean;
    isDark: boolean;
  }
): { shadow: OKLCHColor; highlight: OKLCHColor } {
  const { l, c, h } = baseColor;

  // Calculate adaptive shift amounts
  const baseShift = context.isSaturated ? 15 : 25;
  const lightnessFactor = context.isDark ? 0.8 : 1.2;
  const chromaFactor = context.isSaturated ? 0.5 : 1.0;

  // Determine shift direction based on color temperature
  const shadowDirection = context.isWarm ? -1 : 1;
  const highlightDirection = context.isWarm ? 1 : -1;

  return {
    shadow: {
      l: Math.max(0, l - 25 * lightnessFactor),
      c: Math.min(0.4, c + 0.1 * chromaFactor),
      h: (h + baseShift * shadowDirection + 360) % 360,
    },
    highlight: {
      l: Math.min(100, l + 20 * lightnessFactor),
      c: Math.min(0.4, c + 0.05 * chromaFactor),
      h: (h + baseShift * highlightDirection + 360) % 360,
    },
  };
}
```

### 3. Temporal Hue Shifting

For animated pixel art with color transitions.

```typescript
/**
 * Temporal hue shifting for animations
 * @param baseColor - Base OKLCH color
 * @param time - Animation time (0-1)
 * @param frequency - Hue shift frequency
 * @returns Animated OKLCH color
 */
function temporalHueShift(baseColor: OKLCHColor, time: number, frequency: number = 1.0): OKLCHColor {
  const { l, c, h } = baseColor;
  const hueShift = Math.sin(time * Math.PI * 2 * frequency) * 10;

  return {
    l: l,
    c: c,
    h: (h + hueShift + 360) % 360,
  };
}
```

## Implementation Examples

### Integration with Reynard OKLCH System

```typescript
import { OKLCHColor, formatOKLCH, oklchToRgb, createTagColorGenerator } from "reynard-colors";

/**
 * Pixel art sprite color generator using Reynard's OKLCH system
 */
class PixelArtColorGenerator {
  private colorGenerator = createTagColorGenerator();

  /**
   * Generate sprite colors with hue shifting
   */
  generateSpriteColors(
    baseColor: OKLCHColor,
    spriteType: "character" | "environment" | "ui",
    material?: string
  ): {
    shadow: string;
    base: string;
    highlight: string;
    accent: string;
  } {
    const shadow = basicHueShift(baseColor, "shadow", 0.4);
    const highlight = basicHueShift(baseColor, "highlight", 0.3);
    const accent = basicHueShift(baseColor, "midtone", 0.2);

    return {
      shadow: formatOKLCH(shadow),
      base: formatOKLCH(baseColor),
      highlight: formatOKLCH(highlight),
      accent: formatOKLCH(accent),
    };
  }

  /**
   * Generate palette for pixel art tileset
   */
  generateTilesetPalette(baseColors: OKLCHColor[], tileCount: number = 16): string[] {
    const palette: string[] = [];

    baseColors.forEach(baseColor => {
      const ramp = generateHueShiftRamp(baseColor, 4);
      ramp.forEach(color => palette.push(formatOKLCH(color)));
    });

    return palette.slice(0, tileCount);
  }
}
```

### Canvas Integration

```typescript
/**
 * Canvas-based pixel art rendering with OKLCH colors
 */
class PixelArtRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  /**
   * Draw pixel with OKLCH color
   */
  drawPixel(x: number, y: number, color: OKLCHColor, pixelSize: number = 1) {
    const rgb = oklchToRgb(color.l / 100, color.c, color.h);
    this.ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }

  /**
   * Draw sprite with hue-shifted colors
   */
  drawSprite(
    sprite: number[][],
    colors: { shadow: OKLCHColor; base: OKLCHColor; highlight: OKLCHColor },
    x: number,
    y: number,
    pixelSize: number = 1
  ) {
    sprite.forEach((row, rowIndex) => {
      row.forEach((pixel, colIndex) => {
        if (pixel === 0) return; // Skip transparent pixels

        let color: OKLCHColor;
        switch (pixel) {
          case 1:
            color = colors.shadow;
            break;
          case 2:
            color = colors.base;
            break;
          case 3:
            color = colors.highlight;
            break;
          default:
            return;
        }

        this.drawPixel(x + colIndex, y + rowIndex, color, pixelSize);
      });
    });
  }
}
```

## Performance Considerations

### Caching Strategies

```typescript
/**
 * Cached hue shifting for performance
 */
class CachedHueShifter {
  private cache = new Map<string, OKLCHColor>();

  getShiftedColor(baseColor: OKLCHColor, shiftType: string, intensity: number): OKLCHColor {
    const key = `${baseColor.l}-${baseColor.c}-${baseColor.h}-${shiftType}-${intensity}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const shifted = basicHueShift(baseColor, shiftType as any, intensity);
    this.cache.set(key, shifted);
    return shifted;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

### Batch Processing

```typescript
/**
 * Batch process multiple colors for efficiency
 */
function batchHueShift(
  colors: OKLCHColor[],
  shiftType: "shadow" | "highlight" | "midtone",
  intensity: number
): OKLCHColor[] {
  return colors.map(color => basicHueShift(color, shiftType, intensity));
}
```

## Integration with Reynard Framework

### Theme Integration

```typescript
import { useOKLCHColors, useTheme } from "reynard-themes";

/**
 * Theme-aware pixel art color generation
 */
function usePixelArtColors() {
  const { getColor, getColorVariant } = useOKLCHColors();
  const { theme } = useTheme();

  const generatePixelArtPalette = (baseColorName: string) => {
    const baseColor = getColor(baseColorName);
    const shadow = getColorVariant(baseColorName, "darker", 0.3);
    const highlight = getColorVariant(baseColorName, "lighter", 0.2);

    return {
      shadow,
      base: baseColor,
      highlight,
      theme: theme(),
    };
  };

  return { generatePixelArtPalette };
}
```

### Component Integration

```typescript
import { Component } from 'solid-js';
import { usePixelArtColors } from './usePixelArtColors';

/**
 * Pixel art preview component
 */
export const PixelArtPreview: Component<{
  baseColor: string;
  sprite: number[][];
}> = (props) => {
  const { generatePixelArtPalette } = usePixelArtColors();
  const palette = generatePixelArtPalette(props.baseColor);

  return (
    <div class="pixel-art-preview">
      {/* Render sprite with hue-shifted colors */}
    </div>
  );
};
```

## Conclusion

OKLCH-based hue shifting provides superior results for pixel art games compared to
traditional color spaces. The algorithms presented here offer:

1. **Perceptual Uniformity**: Consistent visual results across all hues
2. **Material Awareness**: Different shifting patterns for different materials
3. **Performance Optimization**: Caching and batch processing strategies
4. **Framework Integration**: Seamless integration with Reynard's OKLCH system

These techniques enable pixel artists and game developers to create more vibrant, realistic, and
visually appealing pixel art with minimal effort and maximum consistency.

## References

- [OKLCH Color Space Specification](https://www.w3.org/TR/css-color-4/#oklch)
- [Perceptual Color Spaces](https://bottosson.github.io/posts/oklab/)
- [Pixel Art Color Theory](https://lospec.com/palette-list)
- [Reynard OKLCH Implementation](../packages/colors/README.md)
