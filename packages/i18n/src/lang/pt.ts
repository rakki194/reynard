/**
 * PT translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./pt/common";
import { themeTranslations } from "./pt/themes";
import { coreTranslations } from "./pt/core";
import { componentTranslations } from "./pt/components";
import { galleryTranslations } from "./pt/gallery";
import { chartTranslations } from "./pt/charts";
import { authTranslations } from "./pt/auth";
import { chatTranslations } from "./pt/chat";
import { monacoTranslations } from "./pt/monaco";

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
