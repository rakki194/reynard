/**
 * ES translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./es/common";
import { themeTranslations } from "./es/themes";
import { coreTranslations } from "./es/core";
import { componentTranslations } from "./es/components";
import { galleryTranslations } from "./es/gallery";
import { chartTranslations } from "./es/charts";
import { authTranslations } from "./es/auth";
import { chatTranslations } from "./es/chat";
import { monacoTranslations } from "./es/monaco";

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
