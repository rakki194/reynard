/**
 * Canvas Integration for OKLCH Hue Shifting in Pixel Art
 * Main entry point with barrel exports for all canvas integration modules
 */

// Core rendering
export { PixelArtRenderer } from './pixel-art-renderer';

// Sprite rendering
export { SpriteRenderer, type PixelSprite } from './sprite-renderer';

// Tilemap rendering
export { TilemapRenderer, type Tilemap } from './tilemap-renderer';

// Animation
export { SpriteAnimator, type AnimatedSprite } from './sprite-animator';

// Effects and filters
export {
  applyColorFilter,
  createGrayscaleSprite,
  createTintedSprite,
  createBrightnessSprite,
  createContrastSprite,
  createHueShiftedSprite,
  createSaturationSprite
} from './sprite-effects';

// Utility functions
export {
  createSprite,
  createRectSprite,
  createCheckerboardSprite,
  createCircleSprite,
  createLineSprite,
  createExampleCharacter
} from './sprite-utils';

// Example usage
export {
  renderCharacterWithLighting,
  createSimpleScene,
  animateCharacterWithHueShift,
  createPaletteDemo,
  performanceTest
} from './rendering-examples';

// ============================================================================
// OKLCH HUE SHIFTING ALGORITHMS
// ============================================================================

// Core algorithms
export {
  basicHueShift,
  generateHueShiftRamp,
  temporalHueShift,
  adaptiveHueShift
} from './core-algorithms';

// Material patterns
export {
  MATERIAL_PATTERNS,
  materialHueShift,
  getMaterialPattern,
  isSupportedMaterial,
  getSupportedMaterials
} from './material-patterns';

// Advanced techniques
export {
  goldenRatioHuePalette,
  generateComplementaryColor,
  generateTriadicColors,
  generateAnalogousColors,
  generateSplitComplementaryColors,
  generateTetradicColors
} from './advanced-techniques';

// Performance utilities
export {
  CachedHueShifter,
  batchHueShift,
  createColorLookupTable,
  interpolateColors
} from './performance-utils';

// Pixel art utilities
export {
  generateSpriteColors,
  generateTilesetPalette,
  createColorLookupTable as createPixelArtLookupTable,
  generateCharacterPalette,
  generateEnvironmentPalette,
  generateUIPalette
} from './pixel-art-utils';

// Animation utilities
export {
  generateColorKeyframes,
  createBreathingAnimation,
  createShimmerAnimation,
  createColorCyclingAnimation,
  createFadeAnimation,
  createRainbowAnimation
} from './animation-utils';

// Validation utilities
export {
  validateOKLCHColor,
  clampOKLCHColor,
  validateOKLCHColorArray,
  sanitizeOKLCHColorArray,
  colorsApproximatelyEqual,
  validateShiftParameters,
  validateAnimationParameters,
  validateMaterialType,
  getOKLCHValidationErrors
} from './validation-utils';

// Example functions
export {
  createCharacterPalette,
  createEnvironmentPalette,
  createUIPalette,
  createFantasyCharacterPalette,
  createNatureEnvironmentPalette,
  createSciFiUIPalette
} from './examples';

// Re-export types
export type { OKLCHColor } from 'reynard-colors';
