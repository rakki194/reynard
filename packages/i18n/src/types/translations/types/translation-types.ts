/**
 * Translation interface definitions for the Reynard i18n system.
 *
 * This module re-exports all the specific translation interfaces for
 * different packages and components in the Reynard ecosystem.
 */

// Re-export all translation interfaces from modular files
export type { CoreTranslations } from "../../../translations/types/core-translations";
export type { ComponentTranslations } from "../../../translations/types/component-translations";
export type { GalleryTranslations } from "../../../translations/types/gallery-translations";
export type { ChartTranslations } from "../../../translations/types/chart-translations";
export type { AuthTranslations } from "../../../translations/types/auth-translations";
export type { ChatTranslations } from "../../../translations/types/chat-translations";
export type { MonacoTranslations } from "../../../translations/types/monaco-translations";
