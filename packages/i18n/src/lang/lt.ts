/**
 * LT translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./lt/common";
import { themeTranslations } from "./lt/themes";
import { coreTranslations } from "./lt/core";
import { componentTranslations } from "./lt/components";
import { galleryTranslations } from "./lt/gallery";
import { chartTranslations } from "./lt/charts";
import { authTranslations } from "./lt/auth";
import { chatTranslations } from "./lt/chat";
import { monacoTranslations } from "./lt/monaco";

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
