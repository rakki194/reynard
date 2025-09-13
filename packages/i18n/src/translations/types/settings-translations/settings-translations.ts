/**
 * Settings translation type definitions for the Reynard i18n system.
 *
 * This module contains the comprehensive settings translation interfaces
 * composed from modular category-based interfaces for maintainability.
 */

import type { BaseSettingsTranslations } from "./base-settings-translations";
import type { ModelSettingsTranslations } from "./model-settings-translations";
import type { GallerySettingsTranslations } from "./gallery-settings-translations";
import type { TagSettingsTranslations } from "./tag-settings-translations";
import type { AdvancedSettingsTranslations } from "./advanced-settings-translations";

// Main settings translations interface composed from modular interfaces
export interface SettingsTranslations
  extends BaseSettingsTranslations,
    ModelSettingsTranslations,
    GallerySettingsTranslations,
    TagSettingsTranslations,
    AdvancedSettingsTranslations {}
