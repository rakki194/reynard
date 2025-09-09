/**
 * Color and Media Utilities Package
 *
 * This package provides:
 * - OKLCH color generation and manipulation utilities
 * - Theme management with multiple theme support
 * - Media modality handling (image, audio, video)
 * - File type detection and validation
 * - Color palette generation
 */

// Export all types
export * from "./types";

// Export all utilities
export * from "./utils";

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
