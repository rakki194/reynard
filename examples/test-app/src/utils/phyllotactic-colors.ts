/**
 * 🦊 Phyllotactic Color Generation
 * Color utilities for phyllotactic spiral visualization
 */

import { GOLDEN_ANGLE } from './phyllotactic-constants';

/**
 * Color configuration interface
 */
export interface ColorConfig {
  baseHue: number;
  saturation: number;
  lightness: number;
  hueOffset?: number;
}

/**
 * Generate color using golden angle distribution
 * @param index - The index of the element
 * @param config - Color configuration
 */
export function generateGoldenColor(index: number, config: ColorConfig): {
  hue: number;
  saturation: number;
  lightness: number;
} {
  const hue = (config.baseHue + index * GOLDEN_ANGLE + (config.hueOffset || 0)) % 360;
  
  return {
    hue,
    saturation: config.saturation,
    lightness: config.lightness,
  };
}
