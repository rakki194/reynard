/**
 * Color effects and filters for pixel art sprites
 * Provides various visual effects using OKLCH color manipulation
 */

import type { OKLCHColor } from "reynard-colors";
import type { PixelSprite } from "./sprite-renderer";

/**
 * Apply a color filter to a sprite
 */
export function applyColorFilter(
  sprite: PixelSprite,
  filter: (color: OKLCHColor) => OKLCHColor,
): PixelSprite {
  return {
    ...sprite,
    palette: sprite.palette.map(filter),
  };
}

/**
 * Create a grayscale version of a sprite
 */
export function createGrayscaleSprite(sprite: PixelSprite): PixelSprite {
  return applyColorFilter(sprite, (color) => ({
    l: color.l,
    c: 0, // Remove chroma for grayscale
    h: 0,
  }));
}

/**
 * Create a tinted version of a sprite
 */
export function createTintedSprite(
  sprite: PixelSprite,
  tintColor: OKLCHColor,
  intensity: number = 0.5,
): PixelSprite {
  return applyColorFilter(sprite, (color) => ({
    l: color.l,
    c: color.c + tintColor.c * intensity,
    h: (color.h + (tintColor.h - color.h) * intensity + 360) % 360,
  }));
}

/**
 * Create a brightness-adjusted version of a sprite
 */
export function createBrightnessSprite(
  sprite: PixelSprite,
  brightness: number, // -1 to 1, where 0 is no change
): PixelSprite {
  return applyColorFilter(sprite, (color) => ({
    l: Math.max(0, Math.min(100, color.l + brightness * 50)),
    c: color.c,
    h: color.h,
  }));
}

/**
 * Create a contrast-adjusted version of a sprite
 */
export function createContrastSprite(
  sprite: PixelSprite,
  contrast: number, // -1 to 1, where 0 is no change
): PixelSprite {
  return applyColorFilter(sprite, (color) => {
    const factor = (contrast + 1) / 1;
    const newLightness = (color.l - 50) * factor + 50;

    return {
      l: Math.max(0, Math.min(100, newLightness)),
      c: color.c,
      h: color.h,
    };
  });
}

/**
 * Create a hue-shifted version of a sprite
 */
export function createHueShiftedSprite(
  sprite: PixelSprite,
  hueShift: number, // Degrees to shift hue
): PixelSprite {
  return applyColorFilter(sprite, (color) => ({
    l: color.l,
    c: color.c,
    h: (color.h + hueShift + 360) % 360,
  }));
}

/**
 * Create a saturation-adjusted version of a sprite
 */
export function createSaturationSprite(
  sprite: PixelSprite,
  saturation: number, // -1 to 1, where 0 is no change
): PixelSprite {
  return applyColorFilter(sprite, (color) => ({
    l: color.l,
    c: Math.max(0, color.c + saturation * 0.2),
    h: color.h,
  }));
}
