/**
 * HE translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./he/common";
import { themeTranslations } from "./he/themes";
import { coreTranslations } from "./he/core";
import { componentTranslations } from "./he/components";
import { galleryTranslations } from "./he/gallery";
import { chartTranslations } from "./he/charts";
import { authTranslations } from "./he/auth";
import { chatTranslations } from "./he/chat";
import { monacoTranslations } from "./he/monaco";

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
