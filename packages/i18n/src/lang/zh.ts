/**
 * ZH translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./zh/common";
import { themeTranslations } from "./zh/themes";
import { coreTranslations } from "./zh/core";
import { componentTranslations } from "./zh/components";
import { galleryTranslations } from "./zh/gallery";
import { chartTranslations } from "./zh/charts";
import { authTranslations } from "./zh/auth";
import { chatTranslations } from "./zh/chat";
import { monacoTranslations } from "./zh/monaco";

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
