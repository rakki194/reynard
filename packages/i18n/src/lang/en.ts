/**
 * English translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./en/common";
import { themeTranslations } from "./en/themes";
import { coreTranslations } from "./en/core";
import { componentTranslations } from "./en/components";
import { galleryTranslations } from "./en/gallery";
import { chartTranslations } from "./en/charts";
import { authTranslations } from "./en/auth";
import { chatTranslations } from "./en/chat";
import { monacoTranslations } from "./en/monaco";

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
