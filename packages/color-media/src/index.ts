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
export * from './types';

// Export all utilities
export * from './utils';

// Export specific utilities for direct access
export {
  createTagColorGenerator,
  formatOKLCH,
  generateColorPalette,
  generateComplementaryColors,
  adjustLightness,
  adjustSaturation,
} from './utils/colorUtils';

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
} from './utils/themeUtils';

export {
  BaseModality,
  createModality,
  ModalityRegistry,
  formatFileSize,
  formatDuration,
  getFileExtension,
  isImageFile,
  isAudioFile,
  isVideoFile,
  isTextFile,
} from './utils/modalityUtils';
