/**
 * UK translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./uk/common";
import { themeTranslations } from "./uk/themes";
import { coreTranslations } from "./uk/core";
import { componentTranslations } from "./uk/components";
import { galleryTranslations } from "./uk/gallery";
import { chartTranslations } from "./uk/charts";
import { authTranslations } from "./uk/auth";
import { chatTranslations } from "./uk/chat";
import { monacoTranslations } from "./uk/monaco";

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
