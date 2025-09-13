/**
 * Settings translations module exports for the Reynard i18n system.
 *
 * This module provides a barrel export pattern for all settings
 * translation interfaces, maintaining modularity while providing
 * convenient access to all settings types.
 */

export type { BaseSettingsTranslations } from "./base-settings-translations";
export type { ModelSettingsTranslations } from "./model-settings-translations";
export type { GallerySettingsTranslations } from "./gallery-settings-translations";
export type { TagSettingsTranslations } from "./tag-settings-translations";
export type { AdvancedSettingsTranslations } from "./advanced-settings-translations";

// Re-export the main composed interface
export type { SettingsTranslations } from "./settings-translations";
