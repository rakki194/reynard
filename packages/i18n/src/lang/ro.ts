/**
 * RO translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./ro/common";
import { themeTranslations } from "./ro/themes";
import { coreTranslations } from "./ro/core";
import { componentTranslations } from "./ro/components";
import { galleryTranslations } from "./ro/gallery";
import { chartTranslations } from "./ro/charts";
import { authTranslations } from "./ro/auth";
import { chatTranslations } from "./ro/chat";
import { monacoTranslations } from "./ro/monaco";

export default {
  common: commonTranslations,
  themes: themeTranslations,
  core: coreTranslations,
  components: componentTranslations,
  gallery: galleryTranslations,
  charts: chartTranslations,
  auth: authTranslations,
  chat: chatTranslations,
  monaco: monacoTranslations,
} as const satisfies Translations;
