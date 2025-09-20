/**
 * Color and Theme Utilities Package
 *
 * This package provides:
 * - OKLCH color generation and manipulation utilities
 * - Theme management with multiple theme support
 * - Color palette generation and manipulation
 * - Tag-based color generation
 * - Theme persistence and rotation
 */

// Export all types
export * from "./types";

// Export all utilities
export * from "./utils";

// New color conversion and hue shifting utilities are exported via utils/index.ts

// Export specific utilities for direct access
export {
  createTagColorGenerator,
  formatOKLCH,
  generateColorPalette,
  generateComplementaryColors,
  adjustLightness,
  adjustSaturation,
} from "./utils/colorUtils";

export {
  createThemeContext,
  getStoredTheme,
  setStoredTheme,
  getTagStyle,
  isValidTheme,
  getNextTheme,
  getPreviousTheme,
  getThemeByName,
  getAllThemes,
} from "./utils/themeUtils";

// Modality utilities have been moved to reynard-multimodal package
// File utilities have been distributed to their respective packages:
// - Audio utilities -> reynard-audio
// - Video utilities -> reynard-video
// - Image utilities -> reynard-image
// - Modality utilities -> reynard-multimodal
