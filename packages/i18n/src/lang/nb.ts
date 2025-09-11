/**
 * NB translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./nb/common";
import { themeTranslations } from "./nb/themes";
import { coreTranslations } from "./nb/core";
import { componentTranslations } from "./nb/components";
import { galleryTranslations } from "./nb/gallery";
import { chartTranslations } from "./nb/charts";
import { authTranslations } from "./nb/auth";
import { chatTranslations } from "./nb/chat";
import { monacoTranslations } from "./nb/monaco";

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
