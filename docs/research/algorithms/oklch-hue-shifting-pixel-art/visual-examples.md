# Visual Examples and Color Theory

## Overview

This document provides visual examples and detailed explanations of OKLCH hue shifting techniques for pixel art games. Each example demonstrates specific concepts with before/after comparisons and implementation details.

## Basic Hue Shifting Examples

### Example 1: Simple Character Sprite

**Base Color:** `oklch(60% 0.2 120)` (Green)

**Hue Shifted Palette:**

- Shadow: `oklch(30% 0.25 100)` (Darker, cooler green)
- Base: `oklch(60% 0.2 120)` (Original green)
- Highlight: `oklch(80% 0.15 140)` (Lighter, warmer green)

**Implementation:**

```typescript
const baseColor: OKLCHColor = { l: 60, c: 0.2, h: 120 };
const shadow = basicHueShift(baseColor, "shadow", 0.4);
const highlight = basicHueShift(baseColor, "highlight", 0.3);
```

### Example 2: Material-Based Shifting

**Metal Surface:**

- Base: `oklch(50% 0.1 0)` (Gray)
- Shadow: `oklch(20% 0.15 330)` (Cooler, more saturated)
- Highlight: `oklch(80% 0.05 30)` (Warmer, less saturated)

**Skin Surface:**

- Base: `oklch(70% 0.12 30)` (Light skin tone)
- Shadow: `oklch(45% 0.15 10)` (Warmer shadow)
- Highlight: `oklch(85% 0.08 50)` (Warmer highlight)

**Fabric Surface:**

- Base: `oklch(60% 0.2 240)` (Blue fabric)
- Shadow: `oklch(35% 0.22 225)` (Slightly cooler)
- Highlight: `oklch(75% 0.18 255)` (Slightly warmer)

## Advanced Techniques

### Golden Ratio Color Distribution

**Base Palette:** 8 colors using golden ratio distribution

```typescript
const baseColor: OKLCHColor = { l: 60, c: 0.2, h: 0 };
const goldenPalette = goldenRatioHuePalette(baseColor, 8);

// Results in:
// Color 1: oklch(60% 0.2 0)     - Red
// Color 2: oklch(58% 0.21 137)  - Cyan
// Color 3: oklch(62% 0.19 274)  - Purple
// Color 4: oklch(56% 0.22 51)   - Yellow-Green
// Color 5: oklch(64% 0.18 188)  - Blue
// Color 6: oklch(54% 0.23 325)  - Magenta
// Color 7: oklch(66% 0.17 102)  - Green
// Color 8: oklch(52% 0.24 239)  - Blue-Purple
```

### Adaptive Hue Shifting

**Warm Color (Red):**

- Context: `{ isWarm: true, isSaturated: true, isDark: false }`
- Shadow: Shifts toward cooler (blue-purple)
- Highlight: Shifts toward warmer (orange)

**Cool Color (Blue):**

- Context: `{ isWarm: false, isSaturated: true, isDark: false }`
- Shadow: Shifts toward warmer (purple)
- Highlight: Shifts toward cooler (cyan)

**Saturated vs Desaturated:**

- Saturated colors: Smaller hue shifts (15°)
- Desaturated colors: Larger hue shifts (25°)

## Color Theory Applications

### Complementary Color Schemes

**Primary-Secondary Scheme:**

```typescript
const primary: OKLCHColor = { l: 60, c: 0.2, h: 240 }; // Blue
const secondary: OKLCHColor = { l: 60, c: 0.2, h: 60 }; // Yellow (complement)

// Generate hue-shifted variations
const primaryRamp = generateHueShiftRamp(primary, 5);
const secondaryRamp = generateHueShiftRamp(secondary, 5);
```

### Triadic Color Schemes

**Triadic Palette:**

```typescript
const base: OKLCHColor = { l: 60, c: 0.2, h: 0 }; // Red
const triadic1: OKLCHColor = { l: 60, c: 0.2, h: 120 }; // Green
const triadic2: OKLCHColor = { l: 60, c: 0.2, h: 240 }; // Blue

// Each color gets its own hue-shifted ramp
const redRamp = generateHueShiftRamp(base, 4);
const greenRamp = generateHueShiftRamp(triadic1, 4);
const blueRamp = generateHueShiftRamp(triadic2, 4);
```

### Analogous Color Schemes

**Analogous Palette (30° apart):**

```typescript
const base: OKLCHColor = { l: 60, c: 0.2, h: 120 }; // Green
const analogous1: OKLCHColor = { l: 60, c: 0.2, h: 90 }; // Yellow-Green
const analogous2: OKLCHColor = { l: 60, c: 0.2, h: 150 }; // Blue-Green

// Create smooth transitions between analogous colors
const transition1 = interpolateOKLCH(base, analogous1, 0.5);
const transition2 = interpolateOKLCH(base, analogous2, 0.5);
```

## Lighting and Atmosphere

### Day/Night Cycle

**Day Lighting:**

- Increased lightness (+20%)
- Slightly increased chroma (+0.05)
- Warm hue shift (+10°)

**Night Lighting:**

- Decreased lightness (-30%)
- Decreased chroma (-0.1)
- Cool hue shift (-15°)

**Sunset Lighting:**

- Moderate lightness increase (+10%)
- Increased chroma (+0.08)
- Strong warm hue shift (+25°)

### Weather Effects

**Rainy Weather:**

- Decreased lightness (-15%)
- Decreased chroma (-0.12)
- Cool hue shift (-20°)

**Sunny Weather:**

- Increased lightness (+15%)
- Increased chroma (+0.1)
- Warm hue shift (+15°)

**Foggy Weather:**

- Decreased lightness (-25%)
- Decreased chroma (-0.15)
- Neutral hue shift (0°)

## Character Design Examples

### Fantasy Character Palette

**Skin Tones:**

```typescript
const lightSkin: OKLCHColor = { l: 75, c: 0.1, h: 30 };
const mediumSkin: OKLCHColor = { l: 60, c: 0.12, h: 25 };
const darkSkin: OKLCHColor = { l: 40, c: 0.15, h: 20 };

// Each skin tone gets material-based hue shifting
const lightSkinRamp = materialHueShift(lightSkin, "skin");
const mediumSkinRamp = materialHueShift(mediumSkin, "skin");
const darkSkinRamp = materialHueShift(darkSkin, "skin");
```

**Hair Colors:**

```typescript
const blonde: OKLCHColor = { l: 80, c: 0.15, h: 50 };
const brown: OKLCHColor = { l: 45, c: 0.2, h: 25 };
const black: OKLCHColor = { l: 25, c: 0.1, h: 0 };
const red: OKLCHColor = { l: 55, c: 0.25, h: 15 };

// Hair uses fabric material pattern
const blondeRamp = materialHueShift(blonde, "fabric");
const brownRamp = materialHueShift(brown, "fabric");
const blackRamp = materialHueShift(black, "fabric");
const redRamp = materialHueShift(red, "fabric");
```

**Clothing Colors:**

```typescript
const leather: OKLCHColor = { l: 35, c: 0.18, h: 20 };
const metal: OKLCHColor = { l: 50, c: 0.08, h: 0 };
const fabric: OKLCHColor = { l: 60, c: 0.2, h: 240 };

// Each material gets appropriate hue shifting
const leatherRamp = materialHueShift(leather, "fabric");
const metalRamp = materialHueShift(metal, "metal");
const fabricRamp = materialHueShift(fabric, "fabric");
```

## Environment Design Examples

### Natural Environments

**Forest Palette:**

```typescript
const treeTrunk: OKLCHColor = { l: 35, c: 0.15, h: 25 };
const leaves: OKLCHColor = { l: 50, c: 0.2, h: 120 };
const grass: OKLCHColor = { l: 55, c: 0.18, h: 100 };
const dirt: OKLCHColor = { l: 40, c: 0.12, h: 30 };

// Natural materials use subtle hue shifting
const trunkRamp = generateHueShiftRamp(treeTrunk, 3, 10, 8);
const leavesRamp = generateHueShiftRamp(leaves, 4, 15, 12);
const grassRamp = generateHueShiftRamp(grass, 3, 12, 10);
const dirtRamp = generateHueShiftRamp(dirt, 3, 8, 6);
```

**Desert Palette:**

```typescript
const sand: OKLCHColor = { l: 70, c: 0.1, h: 45 };
const rock: OKLCHColor = { l: 45, c: 0.08, h: 20 };
const cactus: OKLCHColor = { l: 50, c: 0.15, h: 120 };
const sky: OKLCHColor = { l: 80, c: 0.05, h: 200 };

// Desert materials have warm hue shifts
const sandRamp = generateHueShiftRamp(sand, 3, 8, 12);
const rockRamp = generateHueShiftRamp(rock, 3, 6, 10);
const cactusRamp = generateHueShiftRamp(cactus, 3, 10, 8);
const skyRamp = generateHueShiftRamp(sky, 3, 5, 8);
```

### Urban Environments

**Building Materials:**

```typescript
const brick: OKLCHColor = { l: 50, c: 0.15, h: 15 };
const concrete: OKLCHColor = { l: 60, c: 0.05, h: 0 };
const metal: OKLCHColor = { l: 55, c: 0.08, h: 0 };
const glass: OKLCHColor = { l: 70, c: 0.1, h: 200 };

// Urban materials use material-specific shifting
const brickRamp = materialHueShift(brick, "fabric");
const concreteRamp = materialHueShift(concrete, "fabric");
const metalRamp = materialHueShift(metal, "metal");
const glassRamp = materialHueShift(glass, "plastic");
```

## Animation Examples

### Color Transitions

**Smooth Color Interpolation:**

```typescript
function interpolateOKLCH(
  color1: OKLCHColor,
  color2: OKLCHColor,
  t: number,
): OKLCHColor {
  return {
    l: color1.l + (color2.l - color1.l) * t,
    c: color1.c + (color2.c - color1.c) * t,
    h: interpolateHue(color1.h, color2.h, t),
  };
}

function interpolateHue(h1: number, h2: number, t: number): number {
  const diff = h2 - h1;
  const shortest = Math.abs(diff) > 180 ? diff - Math.sign(diff) * 360 : diff;
  return (h1 + shortest * t + 360) % 360;
}
```

**Pulsing Effect:**

```typescript
function createPulsingColor(
  baseColor: OKLCHColor,
  time: number,
  frequency: number = 1.0,
  intensity: number = 0.1,
): OKLCHColor {
  const pulse = Math.sin(time * Math.PI * 2 * frequency) * intensity;
  return {
    l: baseColor.l + pulse * 20,
    c: baseColor.c + pulse * 0.05,
    h: baseColor.h,
  };
}
```

**Color Cycling:**

```typescript
function createColorCycle(
  baseColor: OKLCHColor,
  time: number,
  cycleSpeed: number = 1.0,
): OKLCHColor {
  return {
    l: baseColor.l,
    c: baseColor.c,
    h: (baseColor.h + time * cycleSpeed * 360) % 360,
  };
}
```

## Quality Comparison

### RGB vs OKLCH Hue Shifting

**RGB Approach:**

- Inconsistent brightness changes
- Color banding in gradients
- Unpredictable saturation changes
- Poor perceptual uniformity

**OKLCH Approach:**

- Consistent brightness perception
- Smooth gradients
- Predictable color relationships
- Perceptually uniform changes

## Implementation Tips

### Color Palette Organization

1. **Group by Material**: Organize colors by material type (skin, metal, fabric)
2. **Use Consistent Ramping**: Apply the same hue shift pattern to related colors
3. **Maintain Contrast**: Ensure sufficient contrast between shadow and highlight
4. **Test in Context**: Always test colors in the actual game environment

### Performance Considerations

1. **Pre-compute Palettes**: Generate all color variations at load time
2. **Use Caching**: Cache frequently used color combinations
3. **Batch Operations**: Process multiple colors together when possible
4. **Monitor Memory**: Keep track of color cache memory usage

### Visual Quality Guidelines

1. **Subtle Shifts**: Use moderate hue shifts (10-25°) for natural results
2. **Material Consistency**: Apply the same shifting pattern to similar materials
3. **Lighting Context**: Consider the lighting environment when choosing shifts
4. **Artistic Intent**: Use hue shifting to enhance the artistic vision, not replace it

## Conclusion

OKLCH hue shifting provides superior results for pixel art games by ensuring perceptually uniform color changes. The examples in this document demonstrate how to apply these techniques effectively across different game elements, from character sprites to environmental tiles. By following the guidelines and using the provided algorithms, developers can create more vibrant and visually appealing pixel art games.
