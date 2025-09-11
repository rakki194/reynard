/**
 * PL translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./pl/common";
import { themeTranslations } from "./pl/themes";
import { coreTranslations } from "./pl/core";
import { componentTranslations } from "./pl/components";
import { galleryTranslations } from "./pl/gallery";
import { chartTranslations } from "./pl/charts";
import { authTranslations } from "./pl/auth";
import { chatTranslations } from "./pl/chat";
import { monacoTranslations } from "./pl/monaco";

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
