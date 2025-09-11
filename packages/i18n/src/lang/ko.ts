/**
 * KO translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./ko/common";
import { themeTranslations } from "./ko/themes";
import { coreTranslations } from "./ko/core";
import { componentTranslations } from "./ko/components";
import { galleryTranslations } from "./ko/gallery";
import { chartTranslations } from "./ko/charts";
import { authTranslations } from "./ko/auth";
import { chatTranslations } from "./ko/chat";
import { monacoTranslations } from "./ko/monaco";

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
