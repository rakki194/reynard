/**
 * BG translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./bg/common";
import { themeTranslations } from "./bg/themes";
import { coreTranslations } from "./bg/core";
import { componentTranslations } from "./bg/components";
import { galleryTranslations } from "./bg/gallery";
import { chartTranslations } from "./bg/charts";
import { authTranslations } from "./bg/auth";
import { chatTranslations } from "./bg/chat";
import { monacoTranslations } from "./bg/monaco";

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
