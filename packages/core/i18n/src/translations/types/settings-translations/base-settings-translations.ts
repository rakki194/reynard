/**
 * Base settings translation type definitions for the Reynard i18n system.
 *
 * This module contains the core settings translation interfaces
 * for appearance, language, and basic functionality.
 */

import type { TranslationParams, ThemeTranslations } from "../../../types/core/common-types";

// Base settings translations
export interface BaseSettingsTranslations {
  title: string;
  appearance: string;
  theme: ThemeTranslations;
  disableAnimations: string;
  disableAnimationsTooltip: string;
  language: string;
  languageTooltip: string;
  disableNonsense: string;
  disableNonsenseTooltip: string;
  disableCollisionHandling: string;
  disableCollisionHandlingTooltip: string;
  disableModelDownloads: string;
  disableModelDownloadsTooltip: string;
  modelSettings: string | ((params: TranslationParams) => string);
  experimentalFeatures: string;
  enableZoom: string;
  enableZoomTooltip: string;
  enableMinimap: string;
  enableMinimapTooltip: string;
  alwaysShowCaptionEditor: string;
  alwaysShowCaptionEditorTooltip: string;
  treatMetadataAsText: string;
  treatMetadataAsTextTooltip: string;
  showMetadataInBreadcrumb: string;
  showMetadataInBreadcrumbTooltip: string;
  instantDelete: string;
  instantDeleteTooltip: string;
  warning: string;
  gallery: string;
  preserveLatents: string;
  preserveLatentsTooltip: string;
  preserveTxt: string;
  preserveTxtTooltip: string;
  thumbnailSize: string;
  thumbnailSizeDescription: string;
  thumbnailSizeUpdateError: string;
  replaceUnderscores: string;
  replaceUnderscoresDesc: string;
}
